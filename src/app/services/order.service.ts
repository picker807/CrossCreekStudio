import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Order } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';
  private orderSubject = new BehaviorSubject<any[]>([]);
  order$ = this.orderSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialOrders();
   }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private loadInitialOrders() {
    this.getOrders().subscribe((orders) => {
      this.orderSubject.next(orders);
    });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getOrder(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderNumber}`, { headers: this.getAuthHeaders() });
  }

  updateOrder(orderId: string, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}`, { $set: payload }, { headers: this.getAuthHeaders() }).pipe(
      tap((updatedOrder) => {
        this.updateSubject(updatedOrder);
      })
    );
  }

  private updateSubject(updatedOrder: any) {
    const currentOrders = this.orderSubject.getValue();
    const updatedOrders = currentOrders.map((order) =>
      order._id === updatedOrder._id ? updatedOrder : order
    ); 
    this.orderSubject.next(updatedOrders);
  }
}
