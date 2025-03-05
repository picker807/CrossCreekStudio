import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, concatMap, forkJoin, from, map, of, switchMap, tap, toArray } from 'rxjs';
import { EventService } from './event.service';
import { Enrollee, OrderDetails, CartItem } from '../models/interfaces';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private cartIdKey = 'cartId'; // Store UUID locally
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartSubject.asObservable();

  private orderDetailsSubject = new BehaviorSubject<OrderDetails | null>(null);
  orderDetails$ = this.orderDetailsSubject.asObservable();

  constructor(private http: HttpClient, private eventService: EventService) {
    this.initializeCart();
  }

  private getHeaders(): HttpHeaders {
    const cartId = this.getCartId();
    return new HttpHeaders({ 'X-Cart-ID': cartId });
  }

  private getCartId(): string {
    return typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem(this.cartIdKey) || ''
      : '';
  }

  private setCartId(cartId: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.cartIdKey, cartId);
    }
  }

  initializeCart(): void {
    this.getCart().subscribe(cart => this.cartSubject.next(cart.items));
  }

  getCart(): Observable<any> {
    return this.http.get<any>('/api/cart', { headers: this.getHeaders() }).pipe(
      tap(response => this.setCartId(response.cartId)),
      catchError(err => {
        console.error('Error fetching cart:', err);
        return of({ cartId: this.getCartId(), items: [] });
      })
    );
  }

  addEventToCart(event: { eventId: string; quantity: number; enrollees: { firstName: string; lastName: string; email: string; phone: string }[] }): Observable<any> {
    return this.http.post('/api/cart/add', { events: [event] }, { headers: this.getHeaders() }).pipe(
      tap(response => {
        this.setCartId(response.cartId);
        this.cartSubject.next(response.items);
      })
    );
  }
  
  addProductToCart(products: { productId: string; quantity: number }[]): Observable<any> {
    return this.http.post('/api/cart/add', { products }, { headers: this.getHeaders() }).pipe(
      tap(response => {
        this.setCartId(response.cartId);
        this.cartSubject.next(response.items);
      })
    );
  }

  removeFromCart(itemId: string): Observable<any> {
    return this.getCart().pipe(
      concatMap(cart => {
        const updatedItems = cart.items.map(item => ({
          events: item.events?.filter(e => e.eventId !== itemId) || [],
          products: item.products?.filter(p => p.productId !== itemId) || []
        })).filter(item => item.events.length > 0 || item.products.length > 0); // Remove empty items
        return this.http.post('/api/cart/update', { items: updatedItems }, { headers: this.getHeaders() });
      }),
      tap(response => this.cartSubject.next(response.items))
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete('/api/cart', { headers: this.getHeaders() }).pipe(
      tap(() => {
        localStorage.removeItem(this.cartIdKey);
        this.cartSubject.next([]);
      })
    );
  }

  verifyCart(): Observable<{
    validItems: CartItem[],
    invalidItems: { item: CartItem, reason: string }[]
  }> {
    console.log("Starting verifyCart");
    return this.getCart().pipe(
      concatMap(cart => from(cart.items).pipe(
        concatMap((item: CartItem) => {
          // Verify all events and products in this item
          const eventVerifications = item.events?.length
            ? from(item.events).pipe(
                concatMap(eventItem =>
                  this.eventService.getEventById(eventItem.eventId).pipe(
                    map(event => this.verifyEventItem(eventItem, event)),
                    catchError(() => of({ isValid: false, item: { events: [eventItem], products: [] }, reason: 'Error fetching event' }))
                  )
                ),
                toArray()
              )
            : of([]);
  
          const productVerifications = item.products?.length
            ? from(item.products).pipe(
                concatMap(productItem =>
                  this.http.get<any>(`/api/products/${productItem.productId}`).pipe(
                    map(product => this.verifyProductItem(productItem, product)),
                    catchError(() => of({ isValid: false, item: { events: [], products: [productItem] }, reason: 'Error fetching product' }))
                  )
                ),
                toArray()
              )
            : of([]);
  
          return forkJoin([eventVerifications, productVerifications]).pipe(
            map(([eventResults, productResults]) => {
              const allResults = [...eventResults, ...productResults];
              return allResults.every(r => r.isValid)
                ? { isValid: true, item }
                : { isValid: false, item, reason: allResults.find(r => !r.isValid)?.reason || 'Unknown' };
            })
          );
        }),
        toArray(),
        map(results => {
          const validItems = results.filter(r => r.isValid).map(r => r.item);
          const invalidItems = results.filter(r => !r.isValid).map(r => ({ item: r.item, reason: r.reason || 'Unknown' }));
          console.log("Verification result:", { validItems, invalidItems });
          return { validItems, invalidItems };
        })
      ))
    );
  }

  private verifyEventItem(cartEventItem: { eventId: string; quantity: number; enrollees: any[]; event?: any }, event: any): { isValid: boolean, item: CartItem, reason?: string } {
    const item: CartItem = { events: [cartEventItem], products: [] }; // Wrap single event in CartItem
    if (!event) return { isValid: false, item, reason: 'Event no longer exists' };
    const eventDate = new Date(event.date).valueOf();
    const currentDate = new Date().valueOf();
    if (eventDate < currentDate) {
      return { isValid: false, item, reason: 'Event date has passed' };
    }
    return { isValid: true, item };
  }

  private verifyProductItem(cartProductItem: { productId: string; quantity: number; product?: any }, product: any): { isValid: boolean, item: CartItem, reason?: string } {
    const item: CartItem = { events: [], products: [cartProductItem] }; // Wrap single product in CartItem
    if (!product) return { isValid: false, item, reason: 'Product no longer exists' };
    if (product.stock < cartProductItem.quantity) {
      return { isValid: false, item, reason: 'Insufficient stock' };
    }
    return { isValid: true, item };
  }

  storeOrderDetails(details: OrderDetails): void {
    this.orderDetailsSubject.next(details);
  }

  getOrderDetails(): Observable<OrderDetails | null> {
    return this.orderDetails$;
  }

  clearOrderDetails(): void {
    this.orderDetailsSubject.next(null);
  }

  completeCheckout(paymentId: string, shippingAddress: any): Observable<any> {
    return this.getCart().pipe(
      switchMap(cart => this.http.post('/api/checkout/complete', {
        cartId: cart.cartId,
        paymentId,
        shippingAddress
      }, { headers: this.getHeaders() })),
      tap(() => this.clearCart())
    );
  }
}