import { Component, HostListener } from '@angular/core';
import { AuthService } from './core/authentication/auth.service';
import { Router } from '@angular/router';
import { CheckoutService } from './services/checkout.service';
import { AdminService } from './services/admin.service';
import { CartItems } from './models/interfaces';

@Component({
  selector: 'cc-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Cross Creek Studio';
  isAdmin: boolean = false;
  cartItemCount: number = 0;
  isMenuOpen = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private checkoutService: CheckoutService,
    private adminService: AdminService,
    
  ) {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  ngOnInit(): void {
    this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });

    this.checkoutService.cartItems$.subscribe((cartList: CartItems) => {
      console.log("AppComponent recevied cartItems$ update: ", cartList[0]);
      const cart = cartList[0] || { events: [], products: [] };
      this.cartItemCount = cart.events.reduce((sum, e) => sum + (e.enrollees ? e.enrollees.length : 0), 0) +
                          cart.products.reduce((sum, p) => sum + (p.quantity || 0), 0);
      console.log('Cart count:', this.cartItemCount);
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin']).then(() => {
      window.location.reload();
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const menuElement = document.querySelector('.menu');
    const hamburgerButton = document.querySelector('.hamburger7');

    if (this.isMenuOpen && menuElement && hamburgerButton) {
      if (!menuElement.contains(event.target as Node) && 
          !hamburgerButton.contains(event.target as Node)) {
        this.isMenuOpen = false;
      }
    }
  }
}
