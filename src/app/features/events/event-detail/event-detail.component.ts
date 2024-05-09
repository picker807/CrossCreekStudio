import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Event } from '../event.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event.service';
import { AuthService } from '../../../core/authentication/authentication.service';



@Component({
  selector: 'cc-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent implements OnInit {
  @Input() public event: Event;
  isAdmin: boolean = true;
  
  constructor(private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute){}

    ngOnInit(): void {
      this.authService.isAdmin$.subscribe(isAdmin => {
        this.isAdmin = isAdmin;
      });
      this.route.params.subscribe(params => {
        const id = params['id'];
      
        if (id) {
          this.event = this.eventService.getEventById(id);
        };
        });
      }

      registerForEvent(): void {
        
      }


}
