import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  constructor(private http: HttpClient) {}

  getPaypalClientId(): Observable<{clientId: string}> {
    return this.http.get<{clientId: string}>('/api/paypal-client-id');
  }
}