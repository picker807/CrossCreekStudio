import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { CheckoutService } from '../../../services/checkout.service';
import { EventService } from '../../../services/event.service';
import { Router } from '@angular/router';
import { catchError, concatMap, finalize, forkJoin, from, map, mergeMap, of, Subscription, tap, toArray } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PaypalService } from '../../../services/paypal.service';
import { User } from '../../../models/user.model';
import { OrderDetails, PayPalOrderDetails, CartItem } from '../../../models/interfaces';
import { EmailService } from '../../../services/email.service';
import { MessageService } from '../../../services/message.service';

declare var paypal: any;

interface EnrolleeResult {
  enrollee: User;
  added: boolean;
}


@Component({
  selector: 'cc-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  verificationError: string = '';
  subscription: Subscription;
  validItems: CartItem[] = [];
  invalidItems: { item: any, reason: string }[] = [];

  @ViewChild('paypalButton') paypalButton: ElementRef;
  showPaypalButton: boolean = false;
  paypalClientId: string;

  
  constructor(
    private checkoutService: CheckoutService,
    private eventService: EventService,
    private router: Router,
    private paypalService: PaypalService,
    private emailService: EmailService,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.subscription = this.checkoutService.cartItems$.subscribe((cartList: any[]) => {
      this.cartItems = cartList;
    });
    this.loadCart();
    this.paypalService.getPaypalClientId().subscribe({
      next: (result) => {
        this.paypalClientId = result.clientId;
      },
      error: (error) => console.error('Error fetching PayPal client ID:', error)
    });
  }

  loadCart(): void {
    this.cartItems = this.checkoutService.getCart();
    this.calculateTotalPrice();
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.cartItems?.reduce((total, item) => 
      total + Number(item.event.price) * item.enrollees.length, 0) ?? 0;
  }

  removeFromCart(eventId: string): void {
    this.checkoutService.removeFromCart(eventId);
    this.loadCart();
  }

  verifyAndCheckout(): void {
    console.log("starting verification and checkout...");
  
    this.checkoutService.verifyCart().pipe(
      tap(result => console.log("Received result in component:", result)),
      finalize(() => console.log('verifyCart observable completed'))
    ).subscribe({
      next: (result) => {
        console.log('Verification completed:', result);
        this.validItems = result.validItems;
        this.invalidItems = result.invalidItems;
  
        if (this.invalidItems.length === 0) {
          console.log('Cart is valid. Loading PayPal script...', this.invalidItems);
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
        /* onClick: (data, actions) => {
          return actions.resolve();
        }, */
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
            console.log('Transaction details: ' + JSON.stringify(details, null, 2));
            console.log("Valid items list: ", JSON.stringify(this.validItems, null, 2));

            // Process each valid item (event) sequentially
            from(this.validItems).pipe(
              concatMap(item => {
                return from(item.enrollees).pipe(
                  concatMap((enrollee: User) => 
                    this.eventService.addUserToEvent(enrollee, item.event.id).pipe(
                      map(added => ({ enrollee, added } as EnrolleeResult))
                    )
                  ),
                  toArray(),
                  map((results: EnrolleeResult[]) => {
                    const addedUsers = results.filter(r => r.added).map(r => r.enrollee);
                    console.log(`Added ${addedUsers.length} new users to event ${item.event.id}`);

                    addedUsers.forEach(user => {
                      this.sendConfirmationEmail(user, item.event);
                    });

                    return addedUsers;
                  }),
                  catchError(error => {
                    console.error(`Error processing enrollees for event ${item.event.id}:`, error);
                    this.messageService.showMessage({
                      text: `Error processing enrollees for event ${item.event.name}.`,
                      type: 'error',
                      duration: 5000
                    });
                    return of([]);
                  })
                );
              }),
              catchError(error => {
                console.error('Error in event processing:', error);
                return of(null);
              })
            ).subscribe({
              next: (result) => {
                if (result) console.log('Users processed for event successfully:', result);
              },
              error: (error) => {
                console.error('Error in overall process:', error);
              },
              complete: () => {
                // Combine order details with cart contents
                const combinedOrderData: OrderDetails = {
                  orderDetails: details as PayPalOrderDetails,
                  cartContents: this.validItems
                };
                this.sendReceiptEmail(combinedOrderData);
                this.checkoutService.storeOrderDetails(combinedOrderData);
                // Handle successful payment (e.g., clear cart, show confirmation)
                this.checkoutService.clearCart();
                this.router.navigate(['/confirmation']);
              }
            });
          });
        }
      }).render(this.paypalButton.nativeElement);
    }
  }

  private sendConfirmationEmail(enrollee: User, event: any) {
    const templateData = {
      user: enrollee,
      eventName: event.name,
      eventDate: event.date,
      eventLocation: event.location
    };

    this.emailService.sendEmail(
      [enrollee.email],
      `Confirmation for ${event.name}`,
      'confirmation', // Template name
      templateData
    ).subscribe({
      next: () => {
        console.log(`Confirmation email sent to ${enrollee.email}`);
      },
      error: (error) => {
        console.error(`Failed to send confirmation email to ${enrollee.email}`, error);
        this.messageService.showMessage({
          text: `Failed to send confirmation email to ${enrollee.email}.`,
          type: 'error',
          duration: 5000
        });
      }
    });
  }

  private sendReceiptEmail(orderDetails: OrderDetails) {
    const userEmail = orderDetails.orderDetails.payer.email_address
    
    const templateData = {
      orderDetails
    };

    this.emailService.sendEmail(
      [userEmail],
      'Your Purchase Receipt',
      'receipt', // Template name
      templateData
    ).subscribe({
      next: () => {
        console.log(`Receipt email sent to ${userEmail}`);
      },
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
