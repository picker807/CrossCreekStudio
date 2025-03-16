import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/products';
  private configUrl = '/api/config';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Adjust key if different
    if (!token) {
      console.warn('No token found in localStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
  }

  getProductsAdmin(): Observable<Product[]> { // For admin page
    const headers = this.getAuthHeaders();
    console.log('Fetching from:', `${this.apiUrl}/admin`);
    return this.http.get<Product[]>(`${this.apiUrl}/admin`, { headers });
  }

  getProductById(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${productId}`);
  }

  createProduct(product: Product): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.post<Product>(this.apiUrl, product, { headers });
  }

  updateProduct(productId: string, product: Product): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.put<Product>(`${this.apiUrl}/${productId}`, product, { headers });
  }

  deleteProduct(productId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${productId}`, { headers });
  }

  getConfig(): Observable<{ taxRate: number; shippingRate: number }> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ taxRate: number; shippingRate: number }>(this.configUrl, { headers });
  }

  updateConfig(config: { taxRate?: number; shippingRate?: number }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(this.configUrl, config, { headers });
  }

  uploadFile(file: File, key: string): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);
    return this.http.post<{ imageUrl: string }>('/api/gallery/upload', formData);
  }
}
