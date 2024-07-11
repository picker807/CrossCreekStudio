import { Component, OnInit } from '@angular/core';
import { CheckoutService } from '../../../services/checkout.service';
import { EventService } from '../../../services/event.service';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'cc-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  verificationError: string = '';
  subscription: Subscription;

  constructor(
    private checkoutService: CheckoutService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.checkoutService.cartItems$.subscribe((cartList: any[]) => {
      this.cartItems = cartList;
    });
    this.loadCart();
  }

  loadCart(): void {
    this.cartItems = this.checkoutService.getCart();
    this.calculateTotalPrice();
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.cartItems.reduce((total, item) => 
      total + item.event.price * item.enrollees.length, 0);
  }

  removeFromCart(eventId: string): void {
    this.checkoutService.removeFromCart(eventId);
    this.loadCart();
  }

  verifyAndCheckout(): void {
    const verificationRequests = this.cartItems.map(item => 
      this.eventService.getEventById(item.event.id)
    );

    forkJoin(verificationRequests).subscribe({
      next: (events) => {
        const isValid = events.every((event, index) => {
          const cartItem = this.cartItems[index];
          return event && 
                 event.price === cartItem.event.price;
        });
    
        if (isValid) {
          this.router.navigate(['/checkout']);
        } else {
          this.verificationError = 'Some events in your cart are no longer available or have changed.';
        }
      },
      error: (error) => {
        console.error('Verification failed', error);
        this.verificationError = 'An error occurred while verifying your cart. Please try again.';
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
