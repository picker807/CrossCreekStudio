import { Component, OnInit, OnDestroy } from '@angular/core';
import { CheckoutService } from '../../../services/checkout.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cc-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit, OnDestroy {
  orderDetails: any;
  private orderSubscription: Subscription;

  constructor(private checkoutService: CheckoutService) {}

  ngOnInit() {
    this.orderSubscription = this.checkoutService.getOrderDetails().subscribe(
      details => {
        if (details) {
          this.orderDetails = details;
        } else {
          // Handle case where order details are not available
          // Maybe redirect to home page or show an error
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
    this.checkoutService.clearOrderDetails();
  }
}
