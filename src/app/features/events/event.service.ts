import { Injectable, EventEmitter } from '@angular/core';
import { Event } from './event.model';
import { BehaviorSubject, Observable, Subject, catchError, of, tap, throwError, map, take, switchMap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../user.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3000/events';
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  events$ = this.eventsSubject.asObservable();

  maxEventId: number = 100;
  url: string = 'mongo uri here';

  constructor( private http: HttpClient ) {
    this.loadEvents();

  }

  private loadEvents(): void {
    this.http.get<Event[]>(this.apiUrl).subscribe(events => {
      const eventsWithDates = events.map(event => ({
        ...event,
        date: new Date(event.date)
      }));
      //this.eventsSubject.next(eventsWithDates);
      this.sortAndSend(eventsWithDates);
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
    event.id = '';
    return this.http.post<Event>(this.apiUrl, event).pipe(
      tap(newEvent => {
        const currentEvents = this.eventsSubject.getValue();
        const updatedEvents = [...currentEvents, newEvent];
        this.sortAndSend(updatedEvents);
      }),
      catchError(error => {
        console.error('Error adding event:', error);
        return throwError(() => new Error('Error adding event'));
      })
    );
  }

  updateEvent(event: Event): Observable<Event> {
    const eventToSend = {
      ...event,
      images: event.images.map(image => image.id)
    };

    console.log('Updating event:', eventToSend); 
    return this.http.put<Event>(`${this.apiUrl}/${event.id}`, eventToSend).pipe(
      tap(updatedEvent => {
        console.log("server response: ", updatedEvent);
        const currentEvents = this.eventsSubject.getValue();
        const eventIndex = currentEvents.findIndex(e => e.id === event.id);
        if (eventIndex !== -1) {
          // Ensure the date is a Date object
          if (typeof updatedEvent.date === 'string') {
            updatedEvent.date = new Date(updatedEvent.date);
          }
          currentEvents[eventIndex] = updatedEvent;
          this.sortAndSend([...currentEvents]);
        } else {
          console.error('Event not found in the current events list');
        }
      }),
      catchError(error => {
        console.error('Error updating event:', error);
        return throwError(() => ({
          message: 'Error updating event',
          details: error.message,
          status: error.status
        }));
      })
    );
  }

  sortAndSend(events: Event[]) {
    const sortedEvents = events.sort((a, b) => {
      const aDate = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
      const bDate = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
      return aDate - bDate;
    });
    //console.log("event service is broadcasting")
    this.eventsSubject.next(sortedEvents);
  }


  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentEvents = this.eventsSubject.getValue();
        const updatedEvents = currentEvents.filter(event => event.id !== id);
        this.eventsSubject.next(updatedEvents);
        //this.sortAndSend();
      }),
      catchError(error => {
        console.error('Error deleting event:', error);
        return throwError(() => new Error('Error deleting event'));
      })
    );
  }

  getEventUsers(eventId: string): Observable<User[]> {
    return this.getEventById(eventId).pipe(
      //tap(event => console.log('Fetched event:', event)),
      map(event => event ? event.attendees : [])
    );
  }

  addUserToEvent(user: User, eventId: string): Observable<void> {
    return this.getEventById(eventId).pipe(
      take(1), // Ensure we only take the latest value once
      switchMap(event => {
        if (event) {
          //console.log("Event in addUsertoEvent: ", event);
          const existingUserIndex = event.attendees.findIndex(u => u.email === user.email);
          if (existingUserIndex === -1) {
            event.attendees.push(user);
          } else {
            event.attendees[existingUserIndex] = user;
          }
          //console.log("Event after user is added: ", event);
          return this.updateEvent(event).pipe(
            map(() => {}),
            catchError(error => {
              console.error('Error updating event:', error);
              return throwError(() => new Error('Error updating event'));
            })
          );
        } else {
          return throwError(() => new Error('Event not found'));
        }
      }),
      catchError(error => {
        console.error('Error adding user to event:', error);
        return throwError(() => new Error('Error adding user to event'));
      })
    );
  }  
}

