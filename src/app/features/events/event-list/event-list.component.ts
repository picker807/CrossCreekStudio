import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event } from '../event.model';
import { Subscription } from 'rxjs';
import { EventService } from '../event.service';

@Component({
  selector: 'cc-event-list',
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent implements OnInit, OnDestroy{
  events: Event[] = [];
  subscription: Subscription;
  term: string;

  constructor(private eventService: EventService) {
    console.log('EventListComponent instantiated');
  }

  ngOnInit(): void {
    console.log('Component initialized, fetching events'); 

    this.subscription = this.eventService.eventListChangedEvent.subscribe((eventsList: Event[]) => {
      console.log('Received events:', eventsList);
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
