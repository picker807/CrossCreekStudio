import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { Gallery } from '../../../models/gallery.model';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'cc-gallery-item',
  templateUrl: './gallery-item.component.html',
  styleUrl: './gallery-item.component.css'
})
export class GalleryItemComponent {
  @Input() item: Gallery;

  constructor(
    private router:Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getDetailRoute(itemId: string): string[] {
    if (isPlatformBrowser(this.platformId)) {
      if (window.innerWidth < 768) {
        return ['/gallery/modal-detail', itemId];
      } else {
        return ['/gallery/detail', itemId];
      };
    };
  }
}
