import { Component } from '@angular/core';
import { GalleryService } from '../../services/gallery.service';


@Component({
  selector: 'cc-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  currentSeason: string;
  images: string[] = [];

  constructor(
    private galleryService: GalleryService,
  ) {
    
  }

  ngOnInit() {
    this.currentSeason = this.getCurrentSeason();
    this.loadCategoryItems(this.currentSeason);
  }

  getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if ([12, 1, 2].includes(month)) {
      return 'Winter';
    } else if ([3, 4, 5].includes(month)) {
      return 'Spring';
    } else if ([6, 7, 8].includes(month)) {
      return 'Summer';
    } else {
      return 'Fall';
    }
  }

  private loadCategoryItems(category: string): void {
      this.galleryService.getGalleryItemsByCategory(category).subscribe({
        next: (items) => {
          this.images = items.map(item => item.imageUrl);
        }
      });
  }

} 


