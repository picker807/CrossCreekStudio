import { Component, OnInit } from '@angular/core';
import { GalleryService } from '../gallery.service';
import { Gallery, GalleryCategory } from '../gallery.model';

@Component({
  selector: 'cc-tabs',
  template: `
    <mat-tab-group (selectedTabChange)="onTabChange($event)">
      <mat-tab *ngFor="let category of categories" [label]="category">
        <cc-tab [items]="groupedItems[category]"></cc-tab>
      </mat-tab>
    </mat-tab-group>
  `,
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements OnInit {
  categories = Object.keys(GalleryCategory);
  groupedItems: { [key: string]: Gallery[] } = {};

  constructor(private galleryService: GalleryService) {}

  ngOnInit(): void {
    this.loadCategoryItems(this.categories[0]);
  }

  onTabChange(event: any): void {
    const selectedCategory = this.categories[event.index];
    this.loadCategoryItems(selectedCategory);
  }

  private loadCategoryItems(category: string): void {
    if (!this.groupedItems[category]) {
      this.galleryService.getGalleryItemsByCategory(category).subscribe(items => {
        this.groupedItems[category] = items;
      });
    }
  }
}