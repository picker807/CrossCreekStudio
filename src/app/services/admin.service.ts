import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Admin, AdminCredentials, PasswordChangeRequest, CreateAdminDto } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/admin';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
  }

  login(credentials: AdminCredentials): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
        })
      );
  }

  getAllAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getCurrentAdmin(): Observable<any> {
    console.log("Starting current admin in admin service");
    return this.http.get<any>(`${this.apiUrl}/current`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => console.log("Response in admin service:", JSON.stringify(response, null, 2))),
      catchError(error => {
        console.error("Error in admin service:", error);
        return throwError(() => new Error('Failed to get current admin'));
      })
    );
  }

  createAdmin(adminData: CreateAdminDto): Observable<Admin> {
    return this.http.post<Admin>(this.apiUrl, adminData, {
      headers: this.getAuthHeaders()
    });
  }

  editAdmin(adminId: string, updatedData: Partial<Admin>): Observable<Admin> {
    return this.http.patch<Admin>(`${this.apiUrl}/${adminId}`, updatedData, {
      headers: this.getAuthHeaders()
    });
  }

  //Reset the password of another admin
  resetPassword(adminId: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${adminId}/reset-password`, { newPassword }, {
      headers: this.getAuthHeaders()
    });
  }

  changePassword(request: PasswordChangeRequest): Observable<any> {
    return this.http.patch(`${this.apiUrl}/change-password`, request, {
      headers: this.getAuthHeaders()
    });
  }

  logout(): void {
    localStorage.removeItem('token');
  }
  
}