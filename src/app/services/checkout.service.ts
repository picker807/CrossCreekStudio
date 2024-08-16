import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { EventService } from './event.service';
import { Enrollee, OrderDetails, PayPalOrderDetails } from '../models/interfaces';
import { Event } from '../models/event.model';



@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private cartKey = 'cart';
  private cartSubject = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartSubject.asObservable();

  private orderDetailsSubject = new BehaviorSubject<OrderDetails | null>(null);
  orderDetails$ = this.orderDetailsSubject.asObservable();

  constructor(private http: HttpClient, private eventService: EventService) {
    this.initializeCart();
  }

  initializeCart(): void {
    this.cartSubject.next(this.getCart());
  }

  getCart() {
    if (typeof window !== 'undefined' && window.localStorage){
    return JSON.parse(window.localStorage.getItem(this.cartKey) || '[]');
    }
  }

  addToCart(event: Event, enrollees: Enrollee[]) {

    const simplifiedEvent = {
      id: event.id,
      name: event.name,
      date: event.date,
      price: event.price,
      location: event.location
    };

    const cart = this.getCart();
    cart.push({ event: simplifiedEvent, enrollees: enrollees });
    if (typeof window !== 'undefined' && window.localStorage){
      window.localStorage.setItem(this.cartKey, JSON.stringify(cart));
    }
    this.cartSubject.next(cart);
  }

  removeFromCart(eventId: string) {
    let cart = this.getCart();
    cart = cart.filter((item: any) => item.event.id !== eventId);
    if (typeof window !== 'undefined' && window.localStorage){
      window.localStorage.setItem(this.cartKey, JSON.stringify(cart));
    }
    this.cartSubject.next(cart);
  }

  clearCart() {
    if (typeof window !== 'undefined' && window.localStorage){
      window.localStorage.removeItem(this.cartKey);
      this.cartSubject.next([]);
    }
  }

  verifyCart(): Observable<{
    validItems: any[],
    invalidItems: { item: any, reason: string }[]
  }> {
    const cartItems = this.getCart();
    const verificationObservables = cartItems.map(item => 
      this.eventService.getEventById(item.event.id).pipe(
        map(event => this.verifyCartItem(item, event)),
        catchError(error => {
          console.error(`Error fetching event ${item.event.id}:`, error);
          return of({ isValid: false, item: item, reason: 'Error fetching event' });
        })
      )
    );

    console.log("verified items: ", verificationObservables);

    return forkJoin(verificationObservables).pipe(
      tap(results => console.log('ForkJoin results:', results)),
      map((results: { isValid: boolean, item: any, reason?: string }[])=> {
        const validItems = results.filter(result => result.isValid).map(result => result.item);
        const invalidItems = results.filter(result => !result.isValid).map(result => ({
          item: result.item,
          reason: result.reason
        }));
        console.log("valid items: ", validItems);
        console.log("invalid items: ", invalidItems);
        return { validItems, invalidItems };
      })
    );
  }
  
  private verifyCartItem(cartItem: any, event: any): { isValid: boolean, item: any, reason?: string } {
    if (!event) {
      return { isValid: false, item: cartItem, reason: 'Event no longer exists' };
    }
    if (new Date(event.date) < new Date()) {
      return { isValid: false, item: cartItem, reason: 'Event date has passed' };
    }
    if (event.price !== cartItem.event.price) {
      return { isValid: false, item: cartItem, reason: 'Event price has changed' };
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

}
