import { Injectable, EventEmitter } from '@angular/core';
import { Event } from './event.model';
import { Subject, catchError, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  events: Event[] = [];
  //maxEventId: number;
  //eventSelectedEvent: EventEmitter<Event> = new EventEmitter<Event>();
  eventListChangedEvent = new Subject<Event []>();
  url: string = 'mongo uri here';
  mockEvents = [
    {
      "id": "1",
      "name": "Tech Conference 2024",
      "date": "2024-05-15T09:00:00Z",
      "isVirtual": true,
      "location": "Online",
      "description": "A comprehensive tech conference covering all the latest in software development.",
      "attendees": ["John Doe", "Jane Smith"],
      "isRegistrationOpen": true,
      "imageUrl": "../../../assets/images/mexiduck.png"
    },
    {
      "id": "2",
      "name": "Local Art Festival",
      "date": "2024-06-20T10:00:00Z",
      "isVirtual": false,
      "location": "Central Park",
      "description": "Explore local art and artists at our annual festival in the park.",
      "attendees": ["Emily Johnson", "Chris Lee"],
      "isRegistrationOpen": true,
      "imageUrl": "../../../assets/images/IMG_1892.jpg"
    },
    {
      "id": "3",
      "name": "Live Music Night",
      "date": "2024-07-04T20:00:00Z",
      "isVirtual": false,
      "location": "Downtown Club",
      "description": "Enjoy a night of fantastic live music from top bands.",
      "attendees": ["Michael Brown", "Sarah Davis"],
      "isRegistrationOpen": false,
      "imageUrl": "../../../assets/images/IMG_1837.jpg"
    },
    {
      "id": "4",
      "name": "Virtual Coding Bootcamp",
      "date": "2024-08-01T08:00:00Z",
      "isVirtual": true,
      "location": "Online",
      "description": "Learn to code from scratch in our intensive, month-long virtual bootcamp.",
      "attendees": ["Alice Johnson", "David Wilson"],
      "isRegistrationOpen": true,
      "imageUrl": "https://example.com/images/event4.jpg"
    },
    {
      "id": "5",
      "name": "Health and Wellness Expo",
      "date": "2024-09-15T09:00:00Z",
      "isVirtual": false,
      "location": "Convention Center",
      "description": "Discover the latest in health and wellness at our annual expo.",
      "attendees": ["Patricia Taylor", "Barbara Brown"],
      "isRegistrationOpen": true,
      "imageUrl": "https://example.com/images/event5.jpg"
    },
    {
      "id": "6",
      "name": "International Film Festival",
      "date": "2024-10-10T10:00:00Z",
      "isVirtual": false,
      "location": "Riverfront Theater",
      "description": "Join us for a celebration of international cinema.",
      "attendees": ["Robert Jones", "Jennifer Garcia"],
      "isRegistrationOpen": false,
      "imageUrl": "https://example.com/images/event6.jpg"
    },
    {
      "id": "7",
      "name": "Business Networking Event",
      "date": "2024-11-05T18:00:00Z",
      "isVirtual": false,
      "location": "Hotel Grand Ballroom",
      "description": "Expand your professional network at our quarterly business event.",
      "attendees": ["William Martinez", "Elizabeth Anderson"],
      "isRegistrationOpen": true,
      "imageUrl": "https://example.com/images/event7.jpg"
    },
    {
      "id": "8",
      "name": "Sustainability Workshop",
      "date": "2024-12-01T11:00:00Z",
      "isVirtual": true,
      "location": "Online",
      "description": "Learn about sustainable practices and how to implement them in your daily life.",
      "attendees": ["Joseph Thomas", "Sandra Hernandez"],
      "isRegistrationOpen": true,
      "imageUrl": "https://example.com/images/event8.jpg"
    },
    {
      "id": "9",
      "name": "Annual Charity Ball",
      "date": "2025-01-20T19:00:00Z",
      "isVirtual": false,
      "location": "City Hall",
      "description": "Support a good cause at our glamorous annual charity ball.",
      "attendees": ["Charles Moore", "Lisa Jackson"],
      "isRegistrationOpen": false,
      "imageUrl": "https://example.com/images/event9.jpg"
    },
    {
      "id": "10",
      "name": "New Year's Eve Gala",
      "date": "2025-12-31T23:00:00Z",
      "isVirtual": false,
      "location": "Skyline Rooftop",
      "description": "Ring in the new year with an unforgettable night of celebration.",
      "attendees": ["Mary White", "James Harris"],
      "isRegistrationOpen": true,
      "imageUrl": "https://example.com/images/event10.jpg"
    }
  ]
  

  constructor(  /*private http: HttpClient*/  ) { }


  getEvents(): void {
    console.log('Attempting to fetch events');

    this.events = this.mockEvents.map(event => ({
      ...event,
      date: new Date(event.date)
    }));
    console.log('Fetched events:', this.events);
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

}