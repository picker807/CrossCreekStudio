import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `${process.env.SITE_URL}/api/email`;

  constructor(private http: HttpClient) {}

  sendConfirmationEmail(user: User, eventName: string, eventDate: Date): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm`, { user, eventName, eventDate });
  }

  getEmailPreview(recipients: string[], subject: string, message: string, eventDetails?: any): Observable<any> {
    const emailData = {
      recipients,
      subject,
      message,
      eventDetails
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.post<any>(`${this.apiUrl}/preview`, emailData, { headers });
  }

  sendEmail(users: any[], subject: string, message: string, eventDetails?: any): Observable<any> {
    const emailData = {
      users,
      subject,
      message,
      eventDetails
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.post<any>(`${this.apiUrl}/send`, emailData, { headers });
  }

  sendContactMessage(name: string, email: string, phone: string, subject: string, message: string, contactMethod: string): Observable<any> {
    const contactData = {
      name,
      email,
      phone,
      subject,
      message,
      contactMethod
    }

    const headers = new HttpHeaders( {'Content-Type': 'application/json'});
    return this.http.post<any>(`${this.apiUrl}/contact`, contactData, { headers })
  }
}