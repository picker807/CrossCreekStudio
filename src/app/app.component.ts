import { Component } from '@angular/core';
import { AuthService } from './core/authentication/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'cc-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Cross Creek Creates';
  isAdmin: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  ngOnInit(): void {
    this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin']).then(() => {
      window.location.reload();
    });
  }
}
