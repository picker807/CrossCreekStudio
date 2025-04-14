import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { Admin, AdminCredentials, PasswordChangeRequest, CreateAdminDto } from '../models/admin.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.SITE_URL}/api/admin`;

  private adminsSubject = new BehaviorSubject<Admin[]>([]);
  admins$ = this.adminsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getAllAdmins();
   }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
  }

  private isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getAllAdmins(): void {
    this.http.get<Admin[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    }).subscribe(admins => {this.adminsSubject.next(admins)});
  }

  getCurrentAdmin(): Observable<any> {
    //console.log("Starting current admin in admin service");
    return this.http.get<any>(`${this.apiUrl}/current`, {
      headers: this.getAuthHeaders()
    }).pipe(
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

  //Change the info for another admin - super admin privilege.
  updateAdmin(adminId: string, updatedData: Partial<Admin>): Observable<Admin> {
    //console.log("Updated Data in the Admin Service: ", updatedData);
    return this.http.patch<Admin>(`${this.apiUrl}/${adminId}`, updatedData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(updatedAdmin => {
        //console.log("Updated Admin sent back from serveer: ", updatedAdmin);
        const currentAdmins = this.adminsSubject.value;
        const index = currentAdmins.findIndex(admin => admin.id === adminId);
        if (index !== -1) {
          const updatedAdmins = [
            ...currentAdmins.slice(0, index),
            updatedAdmin,
            ...currentAdmins.slice(index + 1)
          ];
          this.adminsSubject.next(updatedAdmins);
        }
      })
    );
  }

  deleteAdmin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        const currentAdmins = this.adminsSubject.getValue();
        const updatedAdmins = currentAdmins.filter(admin => admin.id !== id);
        this.adminsSubject.next(updatedAdmins);
        //this.sortAndSend();
      }),
      catchError(error => {
        console.error('Error deleting admin:', error);
        return throwError(() => new Error('Error deleting admin'));
      })
    );
  }

  changePassword(request: PasswordChangeRequest): Observable<any> {
    return this.http.patch(`${this.apiUrl}/change-password`, request, {
      headers: this.getAuthHeaders()
    });
  }

  /* logout(): void {
    localStorage.removeItem('token');
  } */
  
}