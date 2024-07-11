import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Event } from '../models/event.model';
import { EventService } from '../services/event.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = 'http://localhost:3000/users';
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

  /* addUser(newUser: User, event: Event): Observable<void> {
    return this.updateUser(newUser).pipe(
      switchMap(user => this.eventService.addUserToEvent(user, event.id)),
      tap({
        next: () => console.log('User added to event successfully'),
        error: (err) => console.error('Error adding user to event:', err)
      }),
      map(() => {})
    );
  } */

  /* private updateUser(newUser: User): Observable<User> {
    //console.log(newUser);
    return this.users$.pipe(
      take(1),
      switchMap(users => {
        let user = users.find(u => u.email === newUser.email);
        //console.log("user in updateUser: ", user);
        if (user) {
          user.firstName = newUser.firstName;
          user.lastName = newUser.lastName;
          user.phone = newUser.phone;
          return this.http.put<User>(`${this.apiUrl}/${user.id}`, user).pipe(
            tap(updatedUser => {
              //console.log('User updated successfully:', updatedUser);
              this.usersSubject.next(users);
            }),
            catchError(err => {
              console.error('Error updating user:', err);
              return throwError(() => err);
            })
          );
        } else {
          newUser.id = '';
          return this.http.post<User>(this.apiUrl, newUser).pipe(
            tap(createdUser => {
              console.log('User created successfully:', createdUser);
              users.push(createdUser);
              this.usersSubject.next(users);
            }),
            catchError(err => {
              console.error('Error creating user:', err);
              return throwError(() => err);
            })
          );
        }
      })
    );
  } */
}


