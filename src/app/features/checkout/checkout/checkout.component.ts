import { Component, OnInit } from '@angular/core';
import { CheckoutService } from '../../../services/checkout.service';
import { Router } from '@angular/router';

@Component({
  selector: 'cc-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  verificationError: string = '';

  constructor(private checkoutService: CheckoutService, private router: Router) {}

  ngOnInit(): void {
    this.cartItems = this.checkoutService.getCart();
    this.calculateTotalPrice();
  }

  calculateTotalPrice() {
    this.totalPrice = this.cartItems.reduce((total, item) => total + item.event.price * item.enrollees.length, 0);
  }

  verifyAndCheckout() {
    this.checkoutService.verifyCart().subscribe(
      (responses) => {
        const valid = responses.every((response: any, index: number) => {
          const cartItem = this.cartItems[index];
          return response && response.price === cartItem.event.price && response.availableSeats >= cartItem.enrollees.length;
        });

        if (valid) {
          // Proceed to payment or order placement
          this.router.navigate(['/payment']);
        } else {
          this.verificationError = 'Some events in your cart are no longer available or have changed.';
        }
      },
      (error) => {
        console.error('Verification failed', error);
        this.verificationError = 'An error occurred while verifying your cart. Please try again.';
      }
    );
  }
}
