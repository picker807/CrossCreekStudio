import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, concatMap, debounceTime, forkJoin, from, map, of, switchMap, tap, toArray } from 'rxjs';
import { EventService } from './event.service';
import { Enrollee, OrderDetails, FlattenedCartItem, CartVerificationResult, CartResponse } from '../models/interfaces';
import { Event } from '../models/event.model';
import { Gallery } from '../models/gallery.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private cartIdKey = 'cartId'; // Store UUID locally
  private cartSubject = new BehaviorSubject<FlattenedCartItem[]>([{ events: [], products: [] }]);
  cartItems$: Observable<FlattenedCartItem[]> = this.cartSubject.asObservable().pipe(
    tap(cartList => console.log('cartItems$ emitted at checkoutService: ', cartList))
  );

  private orderDetailsSubject = new BehaviorSubject<OrderDetails | null>(null);
  orderDetails$ = this.orderDetailsSubject.asObservable();

  constructor(private http: HttpClient, private eventService: EventService) {
    console.log('CheckoutService instance:', this);
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
    this.getCart().subscribe(cart => {
      console.log('Initial cart data:', cart.items);
      this.cartSubject.next(cart.items)
    });
  }

  getCart(): Observable<any> {
    console.log("getCart called by Checkout Service")
    return this.http.get<any>('/api/cart', { headers: this.getHeaders() }).pipe(
      debounceTime(100),
      tap(response => {
        console.log('getCart response:', response);
        this.setCartId(response.cartId)
      }),
      catchError(err => {
        console.error('Error fetching cart:', err);
        return of({ cartId: this.getCartId(), items: [] });
      })
    );
  }

  addEventToCart(event: { eventId: string; enrollees: { firstName: string; lastName: string; email: string; phone: string }[] }): Observable<CartResponse> {
    return this.http.post<CartResponse>('/api/cart/add', { events: [event] }, { headers: this.getHeaders() }).pipe(
      tap(response => {
        console.log('addEventToCart response:', response);
        this.setCartId(response.cartId);
        this.cartSubject.next(response.items || [{ events: [], products: [] }]);
      }),
      catchError(err => {
        console.error('Error adding event to cart:', err);
        this.refreshCart();
        return of({ cartId: this.getCartId(), items: this.cartSubject.getValue() });
      })
    );
  }
  
  addProductToCart(products: { productId: string; quantity: number }[]): Observable<CartResponse> {
    return this.http.post<CartResponse>('/api/cart/add', { products }, { headers: this.getHeaders() }).pipe(
      tap(response => {
        console.log('addProductToCart response:', response);
        this.setCartId(response.cartId);
        this.cartSubject.next(response.items || [{ events: [], products: [] }]);
      }),
      catchError(err => {
        console.error('Error adding product to cart:', err);
        this.refreshCart();
        return of({ cartId: this.getCartId(), items: this.cartSubject.getValue() || [{ events: [], products: [] }] });
      })
    );
  }

  private refreshCart(): void {
    this.getCart().subscribe(cart => {
      console.log('Refreshed cart:', cart);
      console.log('Emitting to cartSubject:', cart.items || [{ events: [], products: [] }]);
      this.cartSubject.next(cart.items || [{ events: [], products: [] }]);
    });
  }

  updateProductQuantity(productId: string, change: number): Observable<any> {
    return this.getCart().pipe(
      concatMap(cart => {
        const updatedItems = cart.items.map(item => ({
          events: item.events.map(event => ({
            eventId: event._id,
            enrollees: event.enrollees
          })),
          products: item.products.map(product => {
            if (product._id === productId) {
              const newQuantity = (product.quantity || 1) + change;
              return {
                productId: product._id,
                quantity: newQuantity > 0 ? newQuantity : 1
              };
            }
            return {
              productId: product._id,
              quantity: product.quantity
            };
          })
        }));
        console.log('Sending to /api/cart/update:', JSON.stringify({ cartId: this.getCartId(), items: updatedItems }, null, 2));
        return this.http.post('/api/cart/update', { cartId: this.getCartId(), items: updatedItems }, { headers: this.getHeaders() });
      }),
      concatMap(() => this.getCart()),
      tap(response => this.cartSubject.next(response.items || [{ events: [], products: [] }]))
    );
  }

  removeEnrollee(eventId: string, enrollee: { firstName: string, lastName: string, email: string }): Observable<any> {
    return this.getCart().pipe(
      concatMap(cart => {
        const updatedItems = cart.items.map(item => ({
          events: item.events.map(event => {
            console.log("Event ID comparison: event.eventId - ", event._id, "::: eventId - ", eventId);
            if (event._id === eventId) {
              const updatedEnrollees = event.enrollees.filter(e =>
                !(e.firstName === enrollee.firstName &&
                  e.lastName === enrollee.lastName &&
                  e.email === enrollee.email)
              );
              return {
                eventId: event._id,
                enrollees: updatedEnrollees
              };
            }
            return {
              eventId: event._id,
              enrollees: event.enrollees
            };
          }),
          products: item.products.map(product => ({
            productId: product._id,
            quantity: product.quantity
          }))
        })).filter(item => item.events.length > 0 || item.products.length > 0);
        console.log('Sending to /api/cart/update:', JSON.stringify({ cartId: this.getCartId(), items: updatedItems }, null, 2));
        return this.http.post('/api/cart/update', { cartId: this.getCartId(), items: updatedItems }, { headers: this.getHeaders() });
      }),
      concatMap(() => this.getCart()),
      tap(response => this.cartSubject.next(response.items || [{ events: [], products: [] }]))
    );
  }

  removeFromCart(itemId: string, type: 'event' | 'product'): Observable<any> {
    return this.http.post('/api/cart/remove', { cartId: this.getCartId(), itemId, type }, { headers: this.getHeaders() }).pipe(
      concatMap(() => this.getCart()),
      tap(response => {
        console.log('Updated cart from getCart:', JSON.stringify(response, null, 2));
        this.cartSubject.next(response.items || [{ events: [], products: [] }]);
      })
    );
  }

  /* removeFromCart(itemId: string): Observable<any> {
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
  } */

  clearCart(): Observable<any> {
    return this.http.delete('/api/cart', { headers: this.getHeaders() }).pipe(
      tap(() => {
        localStorage.removeItem(this.cartIdKey);
        this.cartSubject.next([]);
      })
    );
  }

  verifyCart(): Observable<CartVerificationResult> {
    return this.http.post<CartVerificationResult>('/api/cart/checkout', {}, { headers: this.getHeaders() });
  }

  /* private verifyEventItem(
    cartEventItem: { 
      _id: string; 
      eventId: string; 
      name: string; 
      date: string; 
      price: number; 
      location: string;
      images: Gallery[]; 
      quantity: number; 
      enrollees: any[] 
    },
    event: Event | null
  ): { isValid: boolean, item: FlattenedCartItem, reason?: string } {
    const item: FlattenedCartItem = { events: [cartEventItem], products: [] };
    if (!event) return { isValid: false, item, reason: 'Event no longer exists' };
    const eventDate = new Date(event.date).valueOf();
    const currentDate = new Date().valueOf();
    if (eventDate < currentDate) {
      return { isValid: false, item, reason: 'Event date has passed' };
    }
    return { isValid: true, item };
  }

  private verifyProductItem(
    cartProductItem: { 
      _id: string; 
      productId: string; 
      name: string; 
      price: number; 
      images: string[]; 
      quantity: number 
    },
    product: Product | null
  ): { isValid: boolean, item: FlattenedCartItem, reason?: string } {
    const item: FlattenedCartItem = { events: [], products: [cartProductItem] };
    if (!product) return { isValid: false, item, reason: 'Product no longer exists' };
    return { isValid: true, item };
  } */

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