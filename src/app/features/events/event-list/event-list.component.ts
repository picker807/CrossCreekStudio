import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Event } from '../../../models/event.model';
import { Subscription } from 'rxjs';
import { EventService } from '../../../services/event.service';
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
  pastEvents: Event[] = [];
  loading = true;

  constructor(private eventService: EventService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.authService.isAdmin$.subscribe(isAdmin => {
      console.log("isAdmin in Event List: ", isAdmin);
      this.isAdmin = isAdmin;
    });
    
    this.subscription = this.eventService.events$.subscribe((eventsList: Event[]) => {
      console.log('Received events in list component:', eventsList);
      this.events = eventsList;
      this.loading = false;
      this.filterFutureEvents();
      this.filterPastEvents();
      this.cdRef.detectChanges();
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