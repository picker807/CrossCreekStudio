import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Admin } from '../../models/admin.model';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdminSubject.asObservable();
  private AUTH_API = 'http://localhost:3000/admin';

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.checkAuthStatus();
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.AUTH_API}/register`, { username, password });
  }

  private checkAuthStatus(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token && !this.jwtHelper.isTokenExpired(token)) {
        this.isAdminSubject.next(true);
      } else {
        this.isAdminSubject.next(false);
      }
    } else {
      //console.log("checkAuthStatus in auth service. isPlatformBrowser was false");
      this.isAdminSubject.next(false);
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.AUTH_API}/login`, { email, password })
      .pipe(
        tap((response: any) => {
            localStorage.setItem('token', response.token);
            this.isAdminSubject.next(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getUser(): Observable<Admin | null> {
    return this.http.get<Admin>(`${this.AUTH_API}/user`, { withCredentials: true });
  }

    isAuthenticated(): boolean {
      if (isPlatformBrowser(this.platformId)) {
        const token = localStorage.getItem('token');
        return token != null && !this.jwtHelper.isTokenExpired(token);
      }
      return false; // Not authenticated on server-side
    }
  }