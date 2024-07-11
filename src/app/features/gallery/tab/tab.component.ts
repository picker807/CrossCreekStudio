import { Component, Input, OnInit } from '@angular/core';
import { Gallery } from '../../../models/gallery.model';

@Component({
  selector: 'cc-tab',
  template: `
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div *ngFor="let item of items">
        <cc-gallery-item [item]="item"></cc-gallery-item>
      </div>
    </div>
  `,
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements OnInit {
  @Input() items: Gallery[];

  ngOnInit(): void {
    // Implement lazy loading for images if necessary
  }
}