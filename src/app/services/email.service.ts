import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/* // Define interfaces for different email types
interface EventNotificationData {
  user: { firstName: string, email: string };
  eventDetails: { name: string, date: string, time: string, location: string, daysUntil: number };
  message: string;
}

interface ConfirmationData {
  user: { firstName: string, email: string };
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
}

// Add more interfaces for other email types as needed */

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `${environment.SITE_URL}/api/email`;

  constructor(private http: HttpClient) {}

  sendEmail(recipients: string[], subject: string, templateType: string, templateData: any, requiresAuth: boolean = false): Observable<any> {
    const emailData = {
      recipients,
      subject,
      templateType,
      templateData
    };

    let headers = new HttpHeaders({'Content-Type': 'application/json'});

    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      } else {
        return throwError(() => new Error('Authorization token is required but not found'));
      }
    }

    return this.http.post<any>(`${this.apiUrl}/send`, emailData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getEmailPreview(templateType: string, templateData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/preview`, { emailData: { templateType, templateData } });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}


/* import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { OrderDetails } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `${environment.SITE_URL}/api/email`;

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

  sendReceipt(combinedOrderData: OrderDetails) {
  
      return this.http.post(`${this.apiUrl}/receipt`, { combinedOrderData });

  }
} */