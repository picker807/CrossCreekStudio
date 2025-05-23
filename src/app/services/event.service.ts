import { Injectable } from '@angular/core';
import { Event } from '../models/event.model';
import { BehaviorSubject, Observable, catchError, of, tap, throwError, map, take, switchMap, mergeMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.SITE_URL}/api/events`;
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  events$ = this.eventsSubject.asObservable();

  //maxEventId: number = 100;
  //url: string = 'mongo uri here';

  constructor( private http: HttpClient ) {
    //console.log("Initializing Event Service")
    this.loadEvents();

  }

  private loadEvents(): void {
    if (this.eventsSubject.getValue().length > 0) return;
    this.http.get<Event[]>(this.apiUrl).subscribe(events => {
      //console.log('Loading events:', events);
      const eventsWithDates = events.map(event => ({
        ...event,
        date: new Date(event.date)
      }));
      this.sortAndSend(eventsWithDates);
      //console.log('Events loaded into BehaviorSubject');
    });
  }

  getEventById(idOrSlug: string): Observable<Event> {
    return this.events$.pipe(
      take(1), // Take only the latest value of events$
      mergeMap(events => {
        if (events.length === 0) {
          return this.http.get<Event[]>(this.apiUrl).pipe(
            tap(loadedEvents => this.sortAndSend(loadedEvents)),
            map(loadedEvents => loadedEvents.find(event => event.id === idOrSlug || event.slug === idOrSlug))
          );
        }
        return of(events.find(event => event.id === idOrSlug || event.slug === idOrSlug));
      }),
      map(event => event || null),
      catchError(error => {
        console.error('Error fetching event:', error);
        return of(null); // Return null instead of throwing an error
      })
    );
  }

  createEvent(event: Event): Observable<Event> {
    event.id = '';
    return this.http.post<Event>(this.apiUrl, event).pipe(
      //tap(newEvent => console.log('New event from server:', newEvent)),
      tap(newEvent => {
        const currentEvents = this.eventsSubject.getValue();
        const updatedEvents = [...currentEvents, newEvent];
        //console.log('Updated events before sort:', updatedEvents);
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

    //console.log('Updating event:', eventToSend); 
    return this.http.put<Event>(`${this.apiUrl}/${event.id}`, eventToSend).pipe(
      tap(updatedEvent => {
        //console.log("server response: ", updatedEvent);
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
        //console.error('Error updating event:', error);
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
    //console.log('Sorted events before emitting:', sortedEvents);
    this.eventsSubject.next(sortedEvents);
  }


  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentEvents = this.eventsSubject.getValue();
        const updatedEvents = currentEvents.filter(event => event.id !== id);
        this.eventsSubject.next(updatedEvents);
       
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

  addUserToEvent(user: User, eventId: string): Observable<boolean> {
    return this.getEventById(eventId).pipe(
      take(1), // Ensure we only take the latest value once
      switchMap(event => {
        if (event) {
          //console.log('Current attendees:', event.attendees);
          //console.log("Event in addUsertoEvent: ", event);
          const existingUserIndex = event.attendees.findIndex(u => u.compositeKey === user.compositeKey);
          if (existingUserIndex === -1) {
            // User doesn't exist, add them
            event.attendees.push(user);
            //console.log('Updated attendees:', event.attendees);
            return this.updateEvent(event).pipe(
              map(() => true),
              catchError(error => {
                console.error('Error updating event:', error);
                return throwError(() => new Error('Error updating event'));
              })
            );
          } else {
            // User already exists, don't add or update
            return of(false);
          }
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

