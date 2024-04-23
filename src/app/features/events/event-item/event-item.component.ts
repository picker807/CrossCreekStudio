import { Component, Input } from '@angular/core';
import { Event } from '../event.model';

@Component({
  selector: 'cc-event-item',
  templateUrl: './event-item.component.html',
  styleUrl: './event-item.component.css'
})
export class EventItemComponent {
  @Input() event: Event;
}
