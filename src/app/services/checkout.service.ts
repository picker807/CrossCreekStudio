import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private cartKey = 'cart';
  private cartSubject = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartSubject.asObservable();

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

  addToCart(event: any, enrollees: any[]) {
    const cart = this.getCart();
    cart.push({ event, enrollees });
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
    }
  }

  verifyCart(): Observable<any> {
    const cart = this.getCart();
    const eventVerificationRequests = cart.map((item: any) => 
      this.eventService.getEventById(item.event.id)
    );
    return forkJoin(eventVerificationRequests);
  }
}
