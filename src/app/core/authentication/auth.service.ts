import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Admin } from '../../features/admin/admin.model';
import {jwtDecode} from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  private token: string | null = null;

  private AUTH_API = 'http://localhost:3000/admin/'; // Update with your actual API URL
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.loadToken();
  }

  private loadToken() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth-token');
      if (token) {
        this.token = token;
        if (!this.isTokenExpired(token)) {
          this.isAdminSubject.next(true);
        } else {
          this.logout();
        }
      }
    }
  }

  private isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const expiryTime = decoded.exp * 1000;
    return Date.now() > expiryTime;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.AUTH_API}login`, { email, password }, this.httpOptions)
      .pipe(
        tap(response => {
          if (response.token) {
            this.token = response.token;
            localStorage.setItem('auth-token', this.token);
            this.isAdminSubject.next(true);
          }
        })
      );
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth-token');
    this.isAdminSubject.next(false);
  }

  get isAdmin$(): Observable<boolean> {
    return this.isAdminSubject.asObservable();
  }

  isAuthenticated(): boolean {
    return this.isAdminSubject.value;
  }

  getToken(): string | null {
    return this.token;
  }
}
