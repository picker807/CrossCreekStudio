import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getOrder(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderNumber}`, { headers: this.getAuthHeaders() });
  }

  updateOrder(orderId: string, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}`, { $set: payload }, { headers: this.getAuthHeaders() });
  }
}
