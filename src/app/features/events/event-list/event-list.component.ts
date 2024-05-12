import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event } from '../event.model';
import { Subscription } from 'rxjs';
import { EventService } from '../event.service';
import { AuthService } from '../../../core/authentication/authentication.service';

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

  constructor(private eventService: EventService,
    private authService: AuthService,) {
  }

  ngOnInit(): void {
    this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });
    
    this.subscription = this.eventService.eventListChangedEvent.subscribe((eventsList: Event[]) => {
      this.events = eventsList;
    })
    this.eventService.getEvents();

    
  }

  search (value: string) {
    this.term = value;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
// event location, virtual auto fills location, zoom or facebook, registration is the function of the date up to day of event, users set up attendies like gallery but different. list of attendies is checked agaisnt user list. if user doesnt exist then new user is created. 