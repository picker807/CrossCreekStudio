import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckoutService } from '../../../services/checkout.service';
import { NavigationEnd, Router } from '@angular/router';
import { catchError, concatMap, finalize, from, of, Subscription, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { OrderDetails, PayPalOrderDetails, CartItems, CartVerificationResult, Address } from '../../../models/interfaces';
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
  cartItems: CartItems = { events: [], products: [] };
  totalPrice: number = 0;
  salesTax: number = 0;
  shipping: number = 0;
  taxRate: number = 0;
  shippingRate: number = 0;
  verificationError: string = '';
  subscription: Subscription;
  validItems: CartVerificationResult['validItems'] = { events: [], products: [] };
  invalidItems: CartVerificationResult['invalidItems'] = [];
  showMailingForm: boolean = false;
  mailingForm: FormGroup;
  mailingAddress: Address | null;

  @ViewChild('paypalButton') paypalButton: ElementRef;
  showPaypalButton: boolean = false;

  @ViewChild('addressSection') addressSection!: ElementRef;
  applyMargin: boolean = false;

  constructor(
    private checkoutService: CheckoutService,
    private fb: FormBuilder,
    private router: Router,
    private emailService: EmailService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadRates();
      }
    });

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
    this.subscription = this.checkoutService.cartItems$.subscribe((cartList: CartItems) => {
      //console.log('Received cartList in CartComponent:', cartList);
      this.cartItems = cartList || { events: [], products: [] };
      //console.log('Cart items updated:', this.cartItems);
      this.loadRates();
      this.calculateTotalPrice();
    });
  }

  loadRates() {
    let ratesLoaded = 0;

    this.checkoutService.getTaxRate().subscribe({
      next: (result) => {
        this.taxRate = result.taxRate;
        //console.log('Tax Rate set to:', this.taxRate);
        ratesLoaded++;
        if (ratesLoaded === 2) {
          this.calculateTotalPrice();
          this.cdr.detectChanges();
        }
      },

      error: (err) => console.error('Failed to load tax rate', err)
    });
    this.checkoutService.getShippingRate().subscribe({
      next: (result) => {
        this.shippingRate = result.shippingRate;
        //console.log('Shipping Rate set to:', this.shippingRate);
        ratesLoaded++;
        if (ratesLoaded === 2) {
          this.calculateTotalPrice();
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Failed to load shipping rate', err)
    });
  }

  calculateTotalPrice(): void {
    this.salesTax = 0; // Reset
    this.shipping = 0; // Reset

    const eventTotal = this.cartItems.events.reduce(
      (sum, item) => {
        const price = item.price || 0;
        const quantity = item.enrollees?.length || 1;
        return sum + price * quantity;
      },
      0
    );

    const productTotal = this.cartItems.products.reduce(
      (sum, item) => {
        const price = item.price || 0;
        const subtotal = price * (item.quantity || 1);
        this.shipping += (item.quantity || 1) * this.shippingRate;
        return sum + subtotal;
      },
      0
    );

    this.salesTax = productTotal * this.taxRate;
    this.totalPrice = eventTotal + productTotal + this.salesTax + this.shipping;

    /* console.log(
      'Event total:', eventTotal,
      'Product total:', productTotal,
      'Sales tax:', this.salesTax,
      'Shipping:', this.shipping,
      'Grand total:', this.totalPrice
    );*/
  }

  adjustProductQuantity(itemId: string, change: number) {
    this.checkoutService.updateProductQuantity(itemId, change).subscribe({
      next: () => {
        //console.log('Quantity updated successfully');
      },
      error: (error) => {
        console.error('Error adjusting quantity:', error);
        this.messageService.showMessage({ text: 'Failed to update quantity', type: 'error', duration: 3000 });
      }
    });
  }

  removeEnrollee(eventId: string, enrollee: { firstName: string, lastName: string, email: string }) {
    //console.log('Removing enrollee:', eventId, enrollee);
    this.checkoutService.removeEnrollee(eventId, enrollee).subscribe({
      next: () => {
        //console.log('Enrollee removed successfully');
        // cartSubject updates cartItems$, so UI should refresh
      },
      error: (error) => {
        //console.error('Error removing enrollee:', error);
        this.messageService.showMessage({ text: 'Failed to remove enrollee', type: 'error', duration: 3000 });
      }
    });
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
    //console.log("Starting verification and checkout...");
    this.checkoutService.verifyCart()
    .subscribe({
      next: (result: CartVerificationResult) => {
        //console.log('Verification completed:', result);
        this.validItems = result.validItems;
        this.invalidItems = result.invalidItems.map(item => ({
          item: item.item,
          reason: item.reason
        }));
        this.totalPrice = result.totalPrice;
        this.salesTax = result.salesTax;
        this.shipping = result.shipping;
        this.taxRate = result.taxRate;
        this.shippingRate = result.shippingRate;

        if (this.invalidItems.length === 0) {
          if (this.cartItems.products.length > 0) {
            this.showMailingForm = true; // Show form if products are present
            this.scrollToAddress();
            
          } else {
            this.mailingAddress = null;
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

  scrollToAddress(): void {
    this.applyMargin = true;
    setTimeout(() => {
      this.addressSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        this.applyMargin = false
      }, 500);
    }, 400);
    
  }

  submitMailingAddress(): void {
    if (this.mailingForm.valid) {
      //console.log("Mailing Form Data: ", this.mailingForm.value);
      this.mailingAddress = this.mailingForm.value;
      //console.log("Captured Mailing Address: ", this.mailingAddress);
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
          //console.log('PayPal SDK loaded');
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
            //console.log('Transaction details:', JSON.stringify(details, null, 2));
            /* const addressFromPaypal = {
              street: details.payer.address?.line1 || '',
              city: details.payer.address?.city || '',
              postalCode: details.payer.address?.postal_code || '',
              country: details.payer.address?.country_code || ''
            }; */
            //console.log("mailingAddress second check: ", this.mailingAddress)
            this.checkoutService.completeCheckout(
              data.paymentID, 
              this.mailingAddress, //|| addressFromPaypal, 
              details,
              this.validItems,
              this.salesTax, 
              this.shipping, 
              this.taxRate, 
              this.shippingRate
            ).subscribe({
              next: (response: { orderNumber: string, events: any }) => {
               
                // Send receipt to PayPal payer
                this.sendReceiptEmail(details, response.orderNumber);
                this.sendEnrolleeEmail(response.events);
                
                this.checkoutService.storeOrderId(response.orderNumber);
                this.checkoutService.clearCart().subscribe(() => {
                  this.cartItems = { events: [], products: [] }; // Local reset
                  localStorage.removeItem('cartId'); // Clear cart identifier
                  //this.checkoutService.storeOrderId(response.orderNumber);
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

    private sendEnrolleeEmail(events: any[]) {
      events.forEach(event => {
        event.enrollees.forEach(enrollee => {
          const templateData = {
            user: { firstName: enrollee.firstName },
            eventName: event.eventName,
            eventDate: event.eventDate,
            eventLocation: event.eventLocation
          };
          this.emailService.sendEmail(
            [enrollee.email],
            'Event Registration Confirmation',
            'enroll-event',
            templateData
          ).subscribe({
            error: (error) => console.error(error)
          });
        });
      });
    }

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
      error: (error) => {
        console.error(error);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}