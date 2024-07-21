// src/app/services/email.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
//import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost:3000/api/email';

  constructor(private http: HttpClient) {}

  sendConfirmationEmail(user: User, eventName: string, eventDate: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm`, { user, eventName, eventDate });
  }
}