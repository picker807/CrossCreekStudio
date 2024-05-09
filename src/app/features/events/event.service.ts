import { Injectable, EventEmitter } from '@angular/core';
import { Event } from './event.model';
import { Observable, Subject, catchError, of, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GalleryCategory } from '../gallery/gallery.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  events: Event[] = [];
  maxEventId: number = 100;
  //eventSelectedEvent: EventEmitter<Event> = new EventEmitter<Event>();
  eventListChangedEvent = new Subject<Event[]>();
  url: string = 'mongo uri here';
  mockEvents= [
    {
      "id": "1",
      "name": "Tech Conference 2024",
      "date": "2024-05-15T09:00:00Z",
      "isVirtual": true,
      "location": "Online",
      "description": "A comprehensive tech conference covering all the latest in software development.",
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
  ]
  

  //constructor( private http: HttpClient ) { }

  get eventsChanged(): Observable<Event[]> {
    return this.eventListChangedEvent.asObservable();
  }

  getEvents(): void {

    if (this.events.length === 0) {
      this.events = this.mockEvents.map(event => ({
      ...event,
      date: new Date(event.date)
    }));
    }

    this.sortAndSend();

    /*
    this.http.get<Event[]>(this.url)
      .pipe(
        tap(events => {
          this.events = events;
          this.sortAndSend();
        }),
        catchError(error => {
          console.error('Error fetching events:', error);
          alert('An error occurred while fetching events.');
          return throwError(() => new Error('Error fetching events'));
        })
      )
      .subscribe();

      */
  }

  getEventById(id: string): Event {
    
    const event = this.events.find(event => event.id === id);
    
    return event;
  }

  sortAndSend(): void {
    this.events.sort((a, b) => a.date.getTime() - b.date.getTime());
    this.eventListChangedEvent.next(this.events.slice());
  }

  createEvent(event: Event): void {
    event.id = this.maxEventId.toString();
    this.maxEventId += 1;
    console.log("max Event Id: ", this.maxEventId);
    this.events.push(event);
    console.log("New Event: ", event);
    this.sortAndSend();
    
  }

  updateEvent(originalEvent: Event, newEvent: Event): void {
    console.log("Event service updateEvent - newEvent: ", newEvent)
    if (originalEvent === undefined || originalEvent === null || newEvent === undefined || newEvent === null) {
      return;
    }

    const pos = this.events.indexOf(originalEvent);
    if (pos < 0) {
      return;
    }

    newEvent.id = originalEvent.id;
    this.events[+pos] = newEvent;

    console.log("Event service - after vent added: ", this.events[+pos]);

    this.sortAndSend();
    //return this.http.put<Event>(`${this.url}/${event.id}`, event);
  }

  deleteEvent(id: string): void {
    const index = this.events.findIndex(event => event.id === id);
    if (index !== -1) {
      this.events.splice(index, 1);
    } else {
      console.error('Event not found');
    }
  }
    //return this.http.delete(`${this.url}/${id}`);
  }

