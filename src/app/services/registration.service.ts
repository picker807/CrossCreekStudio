import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Event } from '../models/event.model';
import { EventService } from '../services/event.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = `${environment.SITE_URL}/api/users`;
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(
    private eventService: EventService,
    private http: HttpClient
  ) {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.http.get<User[]>(this.apiUrl).subscribe( {
      next: (users: User[]) => {
        this.usersSubject.next(users);
    },
    error: (error: any) => {
      console.error(error);
    }
    });
  }

  checkUserInEvent(user: User, event: Event): Observable<boolean> {
    return this.eventService.getEventById(event.id).pipe(
      map(fetchedEvent => {
        return fetchedEvent.attendees.some(attendee => attendee.compositeKey === user.compositeKey);
      }),
      catchError(err => {
        console.error('Error checking user in event:', err);
        return throwError(() => err);
      })
    );
  }
}


