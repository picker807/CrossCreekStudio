import { Component } from '@angular/core';
import { AuthService } from './core/authentication/auth.service';
import { Router } from '@angular/router';
import { CheckoutService } from './services/checkout.service';

@Component({
  selector: 'cc-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Cross Creek Creates';
  isAdmin: boolean = false;
  cartItemCount: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private checkoutService: CheckoutService
  ) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  ngOnInit(): void {
    this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });

    this.checkoutService.cartItems$.subscribe((cartList: any[]) => {
      this.cartItemCount = cartList.length;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin']).then(() => {
      window.location.reload();
    });
  }
}
