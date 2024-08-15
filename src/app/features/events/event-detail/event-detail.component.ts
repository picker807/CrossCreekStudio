import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Event } from '../../../models/event.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../core/authentication/auth.service';



@Component({
  selector: 'cc-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent implements OnInit {
  @Input() public event: Event;
  isAdmin: boolean = true;
  currentDate: Date = new Date();
  isRegistrationOpen: boolean = false;
  isUniqueUrl: boolean = false;

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
          this.eventService.getEventById(id).subscribe(event => {
            this.event = event;
            this.checkRegistrationStatus();
            this.checkUniqueUrlAccess();
          });
        }
      });
    }
  
    checkRegistrationStatus(): void {
      this.isRegistrationOpen = this.event.date.getTime() >= this.currentDate.getTime();
    }
  
    checkUniqueUrlAccess(): void {
      const currentUrl = this.router.url;
      this.isUniqueUrl = currentUrl.includes(this.event.slug);
    }

    getUniqueEventUrl(): string {
      return `${window.location.origin}/events/${this.event.slug}`;
    }
}
