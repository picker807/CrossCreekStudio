import { Injectable } from '@angular/core';
import { User } from './user.model';
import { Event } from './events/event.model';
import { EventService } from './events/event.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = 'http://localhost:3000/users';
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();
  /*mockUsers = [
    {
      "id": "1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    {
      "id": "2", 
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com"
    },
    {
      "id": "3",
      "firstName": "Michael",
      "lastName": "Johnson",
      "email": "michael.johnson@example.com"
    },
    {
      "id": "4",
      "firstName": "Emily",
      "lastName": "Williams",
      "email": "emily.williams@example.com"
    },
    {
      "id": "5",
      "firstName": "David",
      "lastName": "Brown",
      "email": "david.brown@example.com"
    },
    {
      "id": "6",
      "firstName": "Sarah",
      "lastName": "Jones",
      "email": "sarah.jones@example.com"
    },
    {
      "id": "7",
      "firstName": "Christopher",
      "lastName": "Miller",
      "email": "christopher.miller@example.com"
    },
    {
      "id": "8",
      "firstName": "Jessica",
      "lastName": "Davis",
      "email": "jessica.davis@example.com"
    },
    {
      "id": "9",
      "firstName": "Matthew",
      "lastName": "Garcia",
      "email": "matthew.garcia@example.com"
    },
    {
      "id": "10",
      "firstName": "Amanda",
      "lastName": "Rodriguez",
      "email": "amanda.rodriguez@example.com"
    }
  ] */

  constructor(
    private eventService: EventService,
    private http: HttpClient
  ) {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.http.get<User[]>(this.apiUrl).subscribe(users => {
      this.usersSubject.next(users);
    },
    (error: any) => {
      console.error(error);
    });
  }

  addUser(newUser: User, event: Event): Observable<void> {
    return this.updateUser(newUser).pipe(
      tap(user => {
        this.eventService.addUserToEvent(user, event.id).subscribe();
      }),
      map(() => {})
    );
  }

  private updateUser(newUser: User): Observable<User> {
    return this.users$.pipe(
      map(users => {
        let user = users.find(u => u.email === newUser.email);
        if (user) {
          user.firstName = newUser.firstName;
          user.lastName = newUser.lastName;
          this.http.put<User>(`${this.apiUrl}/${user.id}`, user).subscribe();
        } else {
          newUser.id = this.generateUniqueId(users);
          this.http.post<User>(this.apiUrl, newUser).subscribe();
          users.push(newUser);
        }
        this.usersSubject.next(users);
        return newUser;
      })
    );
  }

  private generateUniqueId(users: User[]): string {
    return (users.length + 1).toString();
  }
}


