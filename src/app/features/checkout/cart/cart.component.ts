import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckoutService } from '../../../services/checkout.service';
import { Router } from '@angular/router';
import { catchError, concatMap, finalize, from, of, Subscription, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { OrderDetails, PayPalOrderDetails, FlattenedCartItem } from '../../../models/interfaces';
import { EmailService } from '../../../services/email.service';
import { MessageService } from '../../../services/message.service';
import { environment } from '../../../../environments/environment';

declare var paypal: any;

@Component({
  selector: 'cc-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: FlattenedCartItem = { events: [], products: [] };
  totalPrice: number = 0;
  verificationError: string = '';
  subscription: Subscription;
  validItems: FlattenedCartItem[] = [];
  invalidItems: { item: any; reason: string }[] = [];
  showMailingForm: boolean = false;
  mailingForm: FormGroup;
  mailingAddress: any;

  @ViewChild('paypalButton') paypalButton: ElementRef;
  showPaypalButton: boolean = false;

  constructor(
    private checkoutService: CheckoutService,
    private fb: FormBuilder,
    private router: Router,
    private emailService: EmailService,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.mailingForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      street1: ['', [Validators.required, Validators.minLength(5)]],
      street2: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)]], // 2-letter state code
      zip: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]], // US ZIP (e.g., 12345 or 12345-6789)
      country: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.subscription = this.checkoutService.cartItems$.subscribe((cartList: FlattenedCartItem[]) => {
      console.log('Received cartList in CartComponent:', cartList);
      this.cartItems = cartList && cartList[0] ? cartList[0] : { events: [], products: [] };
      console.log('Cart items updated:', this.cartItems);
      this.calculateTotalPrice();
    });
  }

  /* loadCart(): void {
    this.checkoutService.getCart().subscribe(cartResponse => {
      this.checkoutService.updateCart(cartResponse.items);
    });
  } */

  calculateTotalPrice(): void {
    const eventTotal = this.cartItems.events.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || item.enrollees.length),
      0
    );
    const productTotal = this.cartItems.products.reduce(
      (sum, item) => sum + (item.price || 0) * item.quantity,
      0
    );
    this.totalPrice = eventTotal + productTotal;
    console.log('Event total:', eventTotal, 'Product total:', productTotal, 'Grand total:', this.totalPrice);
  }

  adjustProductQuantity(itemId: string, change: number) {
    this.checkoutService.updateProductQuantity(itemId, change).subscribe();
  }

  removeEnrollee(eventId: string, enrollee: { firstName: string, lastName: string, email: string }) {
    console.log('Removing enrollee:', eventId, enrollee);
    this.checkoutService.removeEnrollee(eventId, enrollee).subscribe();
  }

  removeItem (itemId: string, type: 'event' | 'product'): void {
    this.checkoutService.removeFromCart(itemId, type).subscribe({
      next: () => {
        this.messageService.showMessage({ text: `Removed item from cart`, type: 'success', duration: 3000 });
      },
      error: (error) => {
        console.error(`Error removing item:`, error);
        this.messageService.showMessage({ text: `Failed to remove item`, type: 'error', duration: 3000 });
    }
    });
  }

  verifyAndCheckout(): void {
    console.log("Starting verification and checkout...");
    this.checkoutService.verifyCart().pipe(
      finalize(() => console.log('verifyCart observable completed'))
    ).subscribe({
      next: (result) => {
        console.log('Verification completed:', result);
        this.validItems = result.validItems;
        this.invalidItems = result.invalidItems.map(item => ({
          item: item.item,
          reason: item.reason
        }));
        this.totalPrice = result.totalPrice;

        if (this.invalidItems.length === 0) {
          if (this.cartItems.products.length > 0) {
            this.showMailingForm = true; // Show form if products are present
          } else {
            this.loadPayPalScript();
            this.showPaypalButton = true; // Directly to PayPal if only events
          }
        }
      },
      error: (error) => {
        console.error('Cart verification failed', error);
      }
    });
  }

  submitMailingAddress(): void {
    if (this.mailingForm.valid) {
      this.mailingAddress = this.mailingForm.value;
      this.showMailingForm = false;
      this.loadPayPalScript();
      this.showPaypalButton = true;
    } else {
      this.mailingForm.markAllAsTouched(); // Show validation errors
    }
  }

  loadPayPalScript(): void {
    if (isPlatformBrowser(this.platformId)) {
      const paypalApiUrl = environment.paypalApiUrl;
      const paypalClientId = environment.paypalClientId;

      if (!paypalClientId) {
        console.error('PayPal client ID is not set');
        return;
      }

      const scriptSrc = `${paypalApiUrl}/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture`;

      if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
        const script = document.createElement('script');
        script.src = scriptSrc;
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
                value: this.totalPrice.toFixed(2)
              }
            }]
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            console.log('Transaction details:', JSON.stringify(details, null, 2));
            const addressFromPaypal = {
              street: details.payer.address?.line1 || '',
              city: details.payer.address?.city || '',
              postalCode: details.payer.address?.postal_code || '',
              country: details.payer.address?.country_code || ''
            };
            this.checkoutService.completeCheckout(data.paymentID, this.mailingAddress || addressFromPaypal, details).subscribe({
              next: (response: { orderNumber: string }) => {
               
                // Send receipt to PayPal payer
                this.sendReceiptEmail(details, response.orderNumber);
                
                this.checkoutService.storeOrderId(response.orderNumber);
                this.checkoutService.clearCart().subscribe(() => {
                  this.cartItems = { events: [], products: [] }; // Local reset
                  localStorage.removeItem('cartId'); // Clear cart identifier
                  this.checkoutService.storeOrderId(response.orderNumber);
                  this.router.navigate(['/confirmation']);
                });
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
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          this.messageService.showMessage({
            text: 'Payment failed. Please try again.',
            type: 'error',
            duration: 5000
          });
        }
      }).render(this.paypalButton.nativeElement);
    }}

  private sendReceiptEmail(paypalDetails: any, orderNumber) {
    const payerEmail = paypalDetails.payer.email_address;
    const templateData = {
      payerName: paypalDetails.payer.name.given_name,
      orderNumber: orderNumber,
      total: paypalDetails.purchase_units[0].amount.value,
      date: paypalDetails.create_time,
    };

    this.emailService.sendEmail(
      [payerEmail],
      `Your Purchase Receipt - ${orderNumber}`,
      'receipt',
      templateData
    ).subscribe({
      next: () => console.log(`Receipt email sent to ${payerEmail}`),
      error: (error) => {
        console.error(`Failed to send receipt email to ${payerEmail}`, error);
        this.messageService.showMessage({
          text: `Failed to send receipt email to ${payerEmail}.`,
          type: 'error',
          duration: 5000
        });
      }
    });
  }

  /* private sendOrderConfirmationEmail(orderDetails: OrderDetails) {
    const orderEmail = orderDetails.email; // From the mailing address form
    const templateData = { orderDetails };
  
    this.emailService.sendEmail(
      [orderEmail],
      `Your Order Confirmation - ${orderDetails.orderDetails.id}`,
      'order-confirmation',
      templateData
    ).subscribe({
      next: () => console.log('Order confirmation email sent'),
      error: (error) => console.error('Failed to send order confirmation email:', error)
    });
  } */

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}