import { Component, OnInit, OnDestroy } from '@angular/core';
import { CheckoutService } from '../../../services/checkout.service';
import { EmailService } from '../../../services/email.service';
import { Subscription } from 'rxjs';
import { OrderDetails } from '../../../models/interfaces';

@Component({
  selector: 'cc-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit, OnDestroy {
  orderDetails: any;
  private orderSubscription: Subscription;

  constructor(private checkoutService: CheckoutService,
    private emailService: EmailService
  ) {}

  ngOnInit() {
    this.orderSubscription = this.checkoutService.getOrderId().subscribe((orderNumber)=> {
        if (orderNumber) {
          this.checkoutService.getOrderDetails(orderNumber).subscribe({
            next: (order) => {
              this.orderDetails = order;
              this.sendOrderConfirmationEmail(order);
            },
            error: (error) => {
              console.error('Failed to fetch order details:', error);
            },
          });
        } else {
          console.error('No order ID found');
        }
      });
    }
  
  private sendOrderConfirmationEmail(order: any) {
    const orderEmail = order.email;
    const templateData = {
      orderNumber: order.orderNumber,
      items: order.items,
      shippingAddress: order.shippingAddress, 
      total: order.total,
      date: order.date,
      email: order.email
    };

    this.emailService.sendEmail(
      [orderEmail],
      `Your Order Confirmation - ${order.orderNumber}`,
      'order-confirmation',
      templateData
    ).subscribe();
  }

  /* async fetchItemDetails() {
    // If cartContents only has IDs, fetch full details
    for (const item of this.orderDetails.items) {
      for (const event of item.events) {
        if (!event.event) {
          event.event = await this.checkoutService.getEventDetails(event.eventId).toPromise();
        }
      }
      for (const product of item.products) {
        if (!product.product) {
          product.product = await this.checkoutService.getProductDetails(product.productId).toPromise();
        }
      }
    } 
  }*/

  ngOnDestroy() {
    if (this.orderSubscription) {
      this.orderSubscription.unsubscribe();
    }
    this.checkoutService.clearOrderId();
  }
}
