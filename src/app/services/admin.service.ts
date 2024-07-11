import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
        })
      );
  }

  getAllAdmins(): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  resetPassword(adminId: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${adminId}/reset-password`, { newPassword }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/change-password`, { oldPassword, newPassword }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
  }
  
}