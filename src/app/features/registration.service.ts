import { Injectable } from '@angular/core';
import { User } from './user.model';
import { Event } from './events/event.model';
import { EventService } from './events/event.service';
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

  addUser(newUser: User, event: Event): Observable<void> {
    return this.updateUser(newUser).pipe(
      switchMap(user => this.eventService.addUserToEvent(user, event.id)),
      tap({
        next: () => console.log('User added to event successfully'),
        error: (err) => console.error('Error adding user to event:', err)
      }),
      map(() => {})
    );
  }

  private updateUser(newUser: User): Observable<User> {
    return this.users$.pipe(
      take(1), // Ensure we only take the latest value once
      switchMap(users => {
        let user = users.find(u => u.email === newUser.email);
        if (user) {
          user.firstName = newUser.firstName;
          user.lastName = newUser.lastName;
          return this.http.put<User>(`${this.apiUrl}/${user.id}`, user).pipe(
            tap(updatedUser => {
              console.log('User updated successfully:', updatedUser);
              this.usersSubject.next(users);
            }),
            catchError(err => {
              console.error('Error updating user:', err);
              return throwError(err);
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
              return throwError(err);
            })
          );
        }
      })
    );
  }
}


