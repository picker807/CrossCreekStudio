import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  getAllAdmins(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  resetPassword(adminId: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${adminId}/reset-password`, { newPassword });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/change-password`, { oldPassword, newPassword });
  }
  
}