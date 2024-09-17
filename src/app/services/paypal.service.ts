import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  constructor(private http: HttpClient) {}

  getPaypalClientId(): Observable<{clientId: string}> {
    return this.http.get<{clientId: string}>('/api/paypal-client-id').pipe(
      catchError((error) => {
        console.error('Detailed error:', error);
        return throwError(() => new Error('Error fetching PayPal client ID'));
      })
    );
  }
}