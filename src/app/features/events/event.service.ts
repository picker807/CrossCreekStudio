import { Injectable, EventEmitter } from '@angular/core';
import { Event } from './event.model';
import { BehaviorSubject, Observable, Subject, catchError, of, tap, throwError, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GalleryCategory } from '../gallery/gallery.model';
import { User } from '../user.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3000/events';
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  events$ = this.eventsSubject.asObservable();

  maxEventId: number = 100;
  //eventSelectedEvent: EventEmitter<Event> = new EventEmitter<Event>();
  //eventListChangedEvent = new Subject<Event[]>();
  url: string = 'mongo uri here';
  /*mockEvents= [
    {
      "id": "1",
      "name": "Tech Conference 2024",
      "date": "2024-05-15T09:00:00Z",
      "isVirtual": true,
      "location": "Online",
      "description": "A comprehensive tech conference covering all the latest in software development.",
      "price": 35,
      "attendees": [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
      { id: '3', firstName: 'Jim', lastName: 'Beam', email: 'jim.beam@example.com' },
      { id: '4', firstName: 'Jack', lastName: 'Daniels', email: 'jack.daniels@example.com' },
      { id: '5', firstName: 'Johnny', lastName: 'Walker', email: 'johnny.walker@example.com' }
      ],
      "isRegistrationOpen": true,
      "images": [
        { id: '10', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        },
        { id: '11', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        }, ]
    },
    {
      "id": "2",
      "name": "Local Art Festival",
      "date": "2024-06-20T10:00:00Z",
      "isVirtual": false,
      "location": "Central Park",
      "description": "Explore local art and artists at our annual festival in the park.",
      "price": 35,
      "attendees": [
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
      { id: '3', firstName: 'Jim', lastName: 'Beam', email: 'jim.beam@example.com' },
      { id: '4', firstName: 'Jack', lastName: 'Daniels', email: 'jack.daniels@example.com' },
      { id: '5', firstName: 'Johnny', lastName: 'Walker', email: 'johnny.walker@example.com' }
      ],
      "isRegistrationOpen": true,
      "images": [
        { id: '10', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        },
        { id: '11', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        }, ]
    },
    {
      "id": "3",
      "name": "Live Music Night",
      "date": "2024-07-04T20:00:00Z",
      "isVirtual": false,
      "location": "Downtown Club",
      "description": "Enjoy a night of fantastic live music from top bands.",
      "price": 35,
      "attendees": [{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
      { id: '3', firstName: 'Jim', lastName: 'Beam', email: 'jim.beam@example.com' },
      { id: '4', firstName: 'Jack', lastName: 'Daniels', email: 'jack.daniels@example.com' },
      { id: '5', firstName: 'Johnny', lastName: 'Walker', email: 'johnny.walker@example.com' }],
      "isRegistrationOpen": false,
      "images": [
        { id: '10', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        },
        { id: '11', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        }, ]
    },
    {
      "id": "4",
      "name": "Virtual Coding Bootcamp",
      "date": "2024-08-01T08:00:00Z",
      "isVirtual": true,
      "location": "Online",
      "description": "Learn to code from scratch in our intensive, month-long virtual bootcamp.",
      "price": 35,
      "attendees": [{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
      { id: '3', firstName: 'Jim', lastName: 'Beam', email: 'jim.beam@example.com' },
      { id: '4', firstName: 'Jack', lastName: 'Daniels', email: 'jack.daniels@example.com' },
      { id: '5', firstName: 'Johnny', lastName: 'Walker', email: 'johnny.walker@example.com' }],
      "isRegistrationOpen": true,
      "images": [
        { id: '10', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        },
        { id: '11', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        }, ]
    },
    {
      "id": "5",
      "name": "Health and Wellness Expo",
      "date": "2024-09-15T09:00:00Z",
      "isVirtual": false,
      "location": "Convention Center",
      "description": "Discover the latest in health and wellness at our annual expo.",
      "price": 35,
      "attendees": [{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
      { id: '3', firstName: 'Jim', lastName: 'Beam', email: 'jim.beam@example.com' },
      { id: '4', firstName: 'Jack', lastName: 'Daniels', email: 'jack.daniels@example.com' },
      { id: '5', firstName: 'Johnny', lastName: 'Walker', email: 'johnny.walker@example.com' }],
      "isRegistrationOpen": true,
      "images": [
        { id: '10', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        },
        { id: '11', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        }, ]
    },
    {
      "id": "6",
      "name": "International Film Festival",
      "date": "2024-10-10T10:00:00Z",
      "isVirtual": false,
      "location": "Riverfront Theater",
      "description": "Join us for a celebration of international cinema.",
      "price": 35,
      "attendees": [{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
      { id: '3', firstName: 'Jim', lastName: 'Beam', email: 'jim.beam@example.com' },
      { id: '4', firstName: 'Jack', lastName: 'Daniels', email: 'jack.daniels@example.com' },
      { id: '5', firstName: 'Johnny', lastName: 'Walker', email: 'johnny.walker@example.com' }],
      "isRegistrationOpen": false,
      "images": [
        { id: '10', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        },
        { id: '11', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        }, ]
    },
    {
      "id": "7",
      "name": "Business Networking Event",
      "date": "2024-11-05T18:00:00Z",
      "isVirtual": false,
      "location": "Hotel Grand Ballroom",
      "description": "Expand your professional network at our quarterly business event.",
      "price": 35,
      "attendees": [{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
      { id: '3', firstName: 'Jim', lastName: 'Beam', email: 'jim.beam@example.com' },
      { id: '4', firstName: 'Jack', lastName: 'Daniels', email: 'jack.daniels@example.com' },
      { id: '5', firstName: 'Johnny', lastName: 'Walker', email: 'johnny.walker@example.com' }],
      "isRegistrationOpen": true,
      "images": [
        { id: '10', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        },
        { id: '11', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        }, ]
    },
    {
      "id": "8",
      "name": "Sustainability Workshop",
      "date": "2024-12-01T11:00:00Z",
      "isVirtual": true,
      "location": "Online",
      "description": "Learn about sustainable practices and how to implement them in your daily life.",
      "price": 35,
      "attendees": [{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
      { id: '3', firstName: 'Jim', lastName: 'Beam', email: 'jim.beam@example.com' },
      { id: '4', firstName: 'Jack', lastName: 'Daniels', email: 'jack.daniels@example.com' },
      { id: '5', firstName: 'Johnny', lastName: 'Walker', email: 'johnny.walker@example.com' }],
      "isRegistrationOpen": true,
      "images": [
        { id: '10', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        },
        { id: '11', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        }, ]
    },
    {
      "id": "9",
      "name": "Annual Charity Ball",
      "date": "2025-01-20T19:00:00Z",
      "isVirtual": false,
      "location": "City Hall",
      "description": "Support a good cause at our glamorous annual charity ball.",
      "price": 35,
      "attendees": [{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
      { id: '3', firstName: 'Jim', lastName: 'Beam', email: 'jim.beam@example.com' },
      { id: '4', firstName: 'Jack', lastName: 'Daniels', email: 'jack.daniels@example.com' },
      { id: '5', firstName: 'Johnny', lastName: 'Walker', email: 'johnny.walker@example.com' }],
      "isRegistrationOpen": false,
      "images": [
        { id: '10', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        },
        { id: '11', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        }, ]
    },
    {
      "id": "10",
      "name": "New Year's Eve Gala",
      "date": "2025-12-31T23:00:00Z",
      "isVirtual": false,
      "location": "Skyline Rooftop",
      "description": "Ring in the new year with an unforgettable night of celebration.",
      "price": 35,
      "attendees": [{ id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { id: '2', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
      { id: '3', firstName: 'Jim', lastName: 'Beam', email: 'jim.beam@example.com' },
      { id: '4', firstName: 'Jack', lastName: 'Daniels', email: 'jack.daniels@example.com' },
      { id: '5', firstName: 'Johnny', lastName: 'Walker', email: 'johnny.walker@example.com' }],
      "isRegistrationOpen": true,
      "images": [
        { id: '10', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Summer
        },
        { id: '11', name: 'first image', description: "this description", imageUrl: "../../../assets/images/mexiduck.png", category: GalleryCategory.Winter
        }, ]
    }
  ] */

  

    constructor( private http: HttpClient ) {
      this.loadEvents();

    }


    /*get eventsChanged(): Observable<Event[]> {
      return this.eventListChangedEvent.asObservable();
    } */

    private loadEvents(): void {
      this.http.get<Event[]>(this.apiUrl).subscribe(events => {
        const eventsWithDates = events.map(event => ({
          ...event,
          date: new Date(event.date)
        }));
        this.eventsSubject.next(eventsWithDates);
        this.sortAndSend();
      });
    }

    getEventById(id: string): Observable<Event> {
      return this.events$.pipe(
        map(events => events.find(event => event.id === id))
      );
    }

    /*sortAndSend(): void {
      this.events.sort((a, b) => a.date.getTime() - b.date.getTime());
      this.eventListChangedEvent.next(this.events.slice());
    } */

    createEvent(event: Event): Observable<Event> {
      event.id = this.generateUniqueId();
      return this.http.post<Event>(this.apiUrl, event).pipe(
        tap(newEvent => {
          const currentEvents = this.eventsSubject.getValue();
          this.eventsSubject.next([...currentEvents, newEvent]);
          this.sortAndSend();
        }),
        catchError(error => {
          console.error('Error adding event:', error);
          return throwError(() => new Error('Error adding event'));
        })
      );
    }

    updateEvent(event: Event): Observable<Event> {
      return this.http.put<Event>(`${this.apiUrl}/${event.id}`, event).pipe(
        tap(updatedEvent => {
          const currentEvents = this.eventsSubject.getValue();
          const eventIndex = currentEvents.findIndex(e => e.id === event.id);
          currentEvents[eventIndex] = updatedEvent;
          this.eventsSubject.next([...currentEvents]);
          this.sortAndSend();
        }),
        catchError(error => {
          console.error('Error updating event:', error);
          return throwError(() => new Error('Error updating event'));
        })
      );
    }

    deleteEvent(id: string): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
        tap(() => {
          const currentEvents = this.eventsSubject.getValue();
          const updatedEvents = currentEvents.filter(event => event.id !== id);
          this.eventsSubject.next(updatedEvents);
          this.sortAndSend();
        }),
        catchError(error => {
          console.error('Error deleting event:', error);
          return throwError(() => new Error('Error deleting event'));
        })
      );
    }

    getEventUsers(eventId: string): Observable<User[]> {
      return this.getEventById(eventId).pipe(
        map(event => event ? event.attendees : [])
      );
    }

    addUserToEvent(user: User, eventId: string): Observable<void> {
      return this.getEventById(eventId).pipe(
        tap(event => {
          if (event) {
            const existingUserIndex = event.attendees.findIndex(u => u.email === user.email);
            if (existingUserIndex === -1) {
              event.attendees.push(user);
            } else {
              event.attendees[existingUserIndex] = user;
            }
            this.updateEvent(event).subscribe();
          }
        }),
        map(() => {}),
        catchError(error => {
          console.error('Error adding user to event:', error);
          return throwError(() => new Error('Error adding user to event'));
        })
      );
    }

    private sortAndSend(): void {
      const sortedEvents = this.eventsSubject.getValue().sort((a, b) => a.date.getTime() - b.date.getTime());
      this.eventsSubject.next([...sortedEvents]);
    }
  
    private generateUniqueId(): string {
      return (this.maxEventId++).toString();
    }

  }

