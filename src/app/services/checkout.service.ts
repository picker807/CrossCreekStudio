import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, concatMap, finalize, forkJoin, from, map, of, reduce, take, tap, throwError, toArray } from 'rxjs';
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
      concatMap((item: CartItem) => {
        console.log(`Verifying item ${item.event.id}`);
        return this.eventService.getEventById(item.event.id).pipe(
          map(event => this.verifyCartItem(item, event)),
          catchError(error => {
            console.error(`Error fetching event ${item.event.id}:`, error);
            return of({ isValid: false, item: item, reason: 'Error fetching event' });
          })
        );
      }),
      take(cartItems.length), // Ensure the Observable completes after processing all items
      tap(() => console.log("Finished processing all items")),
      reduce((acc, curr) => {
        if (curr.isValid) acc.validItems.push(curr.item);
        else acc.invalidItems.push({item: curr.item, reason: curr.reason || 'Unknown reason'});
        return acc;
      }, {validItems: [], invalidItems: []} as {
        validItems: CartItem[],
        invalidItems: { item: CartItem, reason: string }[]
      }),
      tap(result => console.log("Final verification result:", result)),
      catchError(error => {
        console.error("Error in verifyCart:", error);
        return of({ validItems: [], invalidItems: [] });
      }),
      finalize(() => console.log("verifyCart observable completed"))
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
