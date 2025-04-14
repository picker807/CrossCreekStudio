import { Component, HostListener } from '@angular/core';
import { AuthService } from './core/authentication/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { CheckoutService } from './services/checkout.service';
import { AdminService } from './services/admin.service';
import { CartItems } from './models/interfaces';
import { combineLatest, filter, Subscription } from 'rxjs';

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
  isAlternateStyle: boolean = false;
  isGalleryStyle: boolean = false;

  private subscription: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private checkoutService: CheckoutService,
    private adminService: AdminService,
    
  ) {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  ngOnInit() {
    this.subscription = combineLatest([
      this.authService.isAdmin$,
      this.checkoutService.cartItems$])
      .subscribe(([isAdmin, cartList]: [boolean, CartItems]) => {
      this.isAdmin = isAdmin;
      const cart = cartList || { events: [], products: [] };
      const eventsCount = Array.isArray(cart.events) ? cart.events.reduce((sum, e) => sum + (e.enrollees?.length || 0), 0) : 0;
      const productsCount = Array.isArray(cart.products) ? cart.products.reduce((sum, p) => sum + (p.quantity || 0), 0) : 0;
      this.cartItemCount = eventsCount + productsCount;
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isAlternateStyle =false;
      this.isGalleryStyle = false;
      
      const url = event.urlAfterRedirects;
      if (url.startsWith('/store') || url.startsWith('/events')){
        this.isAlternateStyle = true;
      } else if (url.startsWith('/gallery')){
        this.isGalleryStyle = true;
      }
      
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
