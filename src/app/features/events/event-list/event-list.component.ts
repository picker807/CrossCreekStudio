import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event } from '../../../models/event.model';
import { Subscription } from 'rxjs';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../core/authentication/auth.service';
import { StringFilterPipe } from '../../../core/shared/string-filter.pipe';

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
  pastEvents: Event[] = [];

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
      this.filterPastEvents();
    },
    
    )
  }

  filterFutureEvents(): void {
    const now = new Date();

    this.futureEvents = this.events.filter(event => {
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      return eventDate >= now || (eventDate.toDateString() === now.toDateString() && eventDate.getTime() >= now.getTime());
    });
  }

  filterPastEvents(): void {
    const now = new Date();
    this.pastEvents = this.events.filter(event => {
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      return eventDate < now;
    });
  }
  
  search (value: string) {
    this.term = value;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}