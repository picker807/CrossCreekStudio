import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, concatMap, from, map, of, switchMap, tap, toArray } from 'rxjs';
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

  addEventToCart(event: Event, enrollees: Enrollee[]): Observable<any> {
    const item: CartItem = {
      type: 'event',
      eventId: event.id,
      enrollees: enrollees.map(e => ({
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        phone: e.phone
      })),
      quantity: enrollees.length
    };
    return this.http.post('/api/cart/add', item, { headers: this.getHeaders() }).pipe(
      tap(response => {
        this.setCartId(response.cartId);
        this.cartSubject.next(response.items);
      })
    );
  }

  addProductToCart(productId: string, quantity: number): Observable<any> {
    const item: CartItem = {
      type: 'product',
      productId,
      quantity
    };
    return this.http.post('/api/cart/add', item, { headers: this.getHeaders() }).pipe(
      tap(response => {
        this.setCartId(response.cartId);
        this.cartSubject.next(response.items);
      })
    );
  }

  removeFromCart(itemId: string, type: 'event' | 'product'): Observable<any> {
    return this.getCart().pipe(
      concatMap(cart => {
        const updatedItems = cart.items.filter((item: CartItem) =>
          type === 'event' ? item.eventId !== itemId : item.productId !== itemId
        );
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
          console.log(`Verifying item: ${item.type === 'event' ? item.eventId : item.productId}`);
          if (item.type === 'event') {
            return this.eventService.getEventById(item.eventId!).pipe(
              map(event => this.verifyEventItem(item, event)),
              catchError(() => of({ isValid: false, item, reason: 'Error fetching event' }))
            );
          } else {
            return this.http.get<any>(`/api/products/${item.productId}`).pipe(
              map(product => this.verifyProductItem(item, product)),
              catchError(() => of({ isValid: false, item, reason: 'Error fetching product' }))
            );
          }
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

  private verifyEventItem(cartItem: CartItem, event: any): { isValid: boolean, item: CartItem, reason?: string } {
    if (!event) return { isValid: false, item: cartItem, reason: 'Event no longer exists' };
    const eventDate = new Date(event.date).valueOf();
    const currentDate = new Date().valueOf();
    if (eventDate < currentDate) {
      return { isValid: false, item: cartItem, reason: 'Event date has passed' };
    }
    return { isValid: true, item: cartItem };
  }

  private verifyProductItem(cartItem: CartItem, product: any): { isValid: boolean, item: CartItem, reason?: string } {
    if (!product) return { isValid: false, item: cartItem, reason: 'Product no longer exists' };
    if (product.stock < cartItem.quantity) {
      return { isValid: false, item: cartItem, reason: 'Insufficient stock' };
    }
    return { isValid: true, item: cartItem };
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