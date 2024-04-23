import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Event } from '../event.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event.service';


@Component({
  selector: 'cc-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent implements OnInit {
  @Input() public event: Event;
  
  constructor(private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute){}

    ngOnInit(): void {
      this.route.params.subscribe(params => {
        const id = params['id'];
        if (id) {
          this.event = this.eventService.getEventById(id);
        };
        });
      }


}
