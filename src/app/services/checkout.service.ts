import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, concatMap, defaultIfEmpty, finalize, forkJoin, from, map, mergeMap, of, reduce, take, takeWhile, tap, throwError, toArray } from 'rxjs';
import { EventService } from './event.service';
import { Enrollee, OrderDetails, CartItem } from '../models/interfaces';
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
    validItems: CartItem[],
    invalidItems: { item: CartItem, reason: string }[]
  }> {
    console.log("Starting verifyCart");
    const cartItems = this.getCart();
    console.log("Cart items:", cartItems);
  
    return from(cartItems).pipe(
      concatMap((item: CartItem, index) => {
        console.log(`Starting verification for item ${index + 1}/${cartItems.length}: ${item.event.id}`);
        return this.eventService.getEventById(item.event.id).pipe(
          map(event => {
            console.log(`Fetched event for item ${index + 1}: ${item.event.id}`);
            const result = this.verifyCartItem(item, event);
            console.log(`Verification result for item ${index + 1}: ${item.event.id}`, result);
            return result;
          }),
          catchError(error => {
            console.error(`Error processing item ${index + 1}: ${item.event.id}`, error);
            return of({ isValid: false, item: item, reason: 'Error processing item' });
          }),
          tap(() => console.log(`Finished processing item ${index + 1}: ${item.event.id}`))
        );
      }),
      toArray(),
      map(results => {
        const validItems = results.filter(r => r.isValid).map(r => r.item);
        const invalidItems = results.filter(r => !r.isValid).map(r => ({item: r.item, reason: r.reason || 'Unknown reason'}));
        return {validItems, invalidItems};
      }),
      tap(result => console.log("Final verification result:", result))
    );
  }
  
  private verifyCartItem(cartItem: any, event: any): { isValid: boolean, item: any, reason?: string } {
    console.log("Verifying cart item:", cartItem, "with event:", event);
    if (!event) {
      console.log("event invalid: not found");
      return { isValid: false, item: cartItem, reason: 'Event no longer exists' };
    }
    const eventDate = new Date(event.date).valueOf();
    const cartItemDate = new Date(cartItem.event.date).valueOf();
    const currentDate = new Date().valueOf();

    if (eventDate < currentDate || eventDate !== cartItemDate) {
      console.log("Event invalid: in the past or time has changed");
      return { isValid: false, item: cartItem, reason: 'Event date has passed or time has changed' };
    }
    if (event.location !== cartItem.event.location){
      console.log("Event invalid: Event location changed");
      return { isValid: false, item: cartItem, reason: "Event location has changed"}
    }
    if (event.price !== cartItem.event.price) {
      console.log("evnt invalid: price changed");
      return { isValid: false, item: cartItem, reason: 'Event price has changed' };
    }
    console.log("event is valid");
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
