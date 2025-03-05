import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CheckoutService } from '../../../services/checkout.service';
import { Router } from '@angular/router';
import { catchError, concatMap, finalize, from, of, Subscription, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PaypalService } from '../../../services/paypal.service';
import { OrderDetails, PayPalOrderDetails, CartItem } from '../../../models/interfaces';
import { EmailService } from '../../../services/email.service';
import { MessageService } from '../../../services/message.service';

declare var paypal: any;

@Component({
  selector: 'cc-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem = { events: [], products: [] };
  totalPrice: number = 0;
  verificationError: string = '';
  subscription: Subscription;
  validItems: CartItem[] = [];
  invalidItems: { item: any; reason: string }[] = [];

  @ViewChild('paypalButton') paypalButton: ElementRef;
  showPaypalButton: boolean = false;
  paypalClientId: string;

  constructor(
    private checkoutService: CheckoutService,
    private router: Router,
    private paypalService: PaypalService,
    private emailService: EmailService,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.subscription = this.checkoutService.cartItems$.subscribe((cartList: CartItem[]) => {
      // Assuming cartItems$ emits the full items array; take the first object
      this.cartItems = cartList[0] || { events: [], products: [] };
      this.calculateTotalPrice();
    });
    this.loadCart();
    this.paypalService.getPaypalClientId().subscribe({
      next: (result) => this.paypalClientId = result.clientId,
      error: (error) => console.error('Error fetching PayPal client ID:', error)
    });
  }

  loadCart(): void {
    this.checkoutService.getCart().subscribe(cart => {
      this.cartItems = cart.items[0] || { events: [], products: [] }; 
      console.log('Cart items:', this.cartItems);
      this.calculateTotalPrice();
    });
  }

  calculateTotalPrice(): void {
    const eventTotal = this.cartItems.events.reduce(
      (sum, item) => sum + (item.event.price || 0) * item.quantity,
      0
    );
    const productTotal = this.cartItems.products.reduce(
      (sum, item) => sum + (item.product.price || 0) * item.quantity,
      0
    );
    this.totalPrice = eventTotal + productTotal;
  }

  removeFromCart(eventId: string): void {
    this.checkoutService.removeFromCart(eventId).subscribe({
      next: () => this.loadCart(),
      error: (error) => console.error('Error removing event:', error)
    });
  }

  removeProductFromCart(productId: string): void {
    this.checkoutService.removeFromCart(productId).subscribe({
      next: () => this.loadCart(),
      error: (error) => console.error('Error removing product:', error)
    });
  }

  verifyAndCheckout(): void {
    console.log("Starting verification and checkout...");
    this.checkoutService.verifyCart().pipe(
      finalize(() => console.log('verifyCart observable completed'))
    ).subscribe({
      next: (result) => {
        console.log('Verification completed:', result);
        this.validItems = result.validItems; // Expecting an array from backend
        this.invalidItems = result.invalidItems.map(item => ({
          item: item.item, // Could be event or product object
          reason: item.reason
        }));

        if (this.invalidItems.length === 0) {
          console.log('Cart is valid. Loading PayPal script...');
          this.loadPayPalScript();
          this.showPaypalButton = true;
        } else {
          console.log("Some cart items are invalid");
          this.messageService.showMessage({
            text: 'Some cart items are invalid. Please review your cart.',
            type: 'warning',
            duration: 5000
          });
        }
      },
      error: (error) => {
        console.error('Verification failed', error);
        this.messageService.showMessage({
          text: 'Cart verification failed. Please try again.',
          type: 'error',
          duration: 5000
        });
      }
    });
  }

  loadPayPalScript(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (!document.querySelector('script[src^="https://www.paypal.com/sdk/js"]')) {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${this.paypalClientId}&currency=USD&intent=capture`;
        script.onload = () => {
          console.log('PayPal SDK loaded');
          this.initializePayPalButton();
        };
        document.body.appendChild(script);
      } else {
        this.initializePayPalButton();
      }
    }
  }

  initializePayPalButton(): void {
    if (typeof paypal !== 'undefined') {
      paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: this.totalPrice.toString()
              }
            }]
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            console.log('Transaction details:', JSON.stringify(details, null, 2));
            this.checkoutService.completeCheckout(data.paymentID, {
              street: details.payer.address?.line1 || '',
              city: details.payer.address?.city || '',
              postalCode: details.payer.address?.postal_code || '',
              country: details.payer.address?.country_code || ''
            }).subscribe({
              next: (order) => {
                const combinedOrderData: OrderDetails = {
                  orderDetails: details as PayPalOrderDetails,
                  cartContents: this.validItems
                };
                this.sendReceiptEmail(combinedOrderData);
                this.checkoutService.storeOrderDetails(combinedOrderData);
                this.router.navigate(['/confirmation']);
              },
              error: (error) => {
                console.error('Checkout failed:', error);
                this.messageService.showMessage({
                  text: 'Checkout failed. Please try again.',
                  type: 'error',
                  duration: 5000
                });
              }
            });
          });
        }
      }).render(this.paypalButton.nativeElement);
    }
  }

  private sendReceiptEmail(orderDetails: OrderDetails) {
    const userEmail = orderDetails.orderDetails.payer.email_address;
    const templateData = { orderDetails };

    this.emailService.sendEmail(
      [userEmail],
      'Your Purchase Receipt',
      'receipt',
      templateData
    ).subscribe({
      next: () => console.log(`Receipt email sent to ${userEmail}`),
      error: (error) => {
        console.error(`Failed to send receipt email to ${userEmail}`, error);
        this.messageService.showMessage({
          text: `Failed to send receipt email to ${userEmail}.`,
          type: 'error',
          duration: 5000
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}