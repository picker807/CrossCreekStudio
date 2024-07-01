import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event } from '../event.model';
import { Subscription } from 'rxjs';
import { EventService } from '../event.service';
import { AuthService } from '../../../core/authentication/auth.service';

@Component({
  selector: 'cc-event-list',
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent implements OnInit, OnDestroy{
  events: Event[] = [];
  subscription: Subscription;
  term: string;
  isAdmin: boolean = true;
  currentDate: Date = new Date();
  futureEvents: Event[] = [];

  constructor(private eventService: EventService,
    private authService: AuthService,) {
  }

  ngOnInit(): void {
    this.authService.isAdmin$.subscribe(isAdmin => {
      console.log("isAdmin in Event List: ", isAdmin);
      this.isAdmin = isAdmin;
    });
    
    this.subscription = this.eventService.events$.subscribe((eventsList: Event[]) => {
      this.events = eventsList;
      this.filterFutureEvents();
    },
    
    )
    //this.eventService.getEvents();
  }

  filterFutureEvents(): void {
    this.futureEvents = this.events.filter(event => {
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      return eventDate.getTime() >= this.currentDate.getTime();
    });
    
  }
  
  search (value: string) {
    this.term = value;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
// event location, virtual auto fills location, zoom or facebook, registration is the function of the date up to day of event, users set up attendies like gallery but different. list of attendies is checked agaisnt user list. if user doesnt exist then new user is created. Fix filtering