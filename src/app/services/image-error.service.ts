// src/app/services/image-error.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageErrorService {
  private defaultImage: string = '/assets/images/no-image-available.png';

  initialize(): void {
    // Handle runtime errors (e.g., 404s, network issues)
    document.addEventListener('error', (event: Event) => {
      const target = event.target as HTMLImageElement;
      if (target.tagName === 'IMG') {
        //console.log('Image error detected for:', target.src);
        if (target.src !== this.defaultImage) {
          target.src = this.defaultImage;
          //console.log('Set to default:', this.defaultImage);
        }
      }
    }, true); // Use capture phase to catch errors early

    // Handle invalid src values after rendering
    setTimeout(() => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.src || img.src === window.location.href || img.src.includes('undefined') || img.src.includes('null')) {
          //console.log('Invalid src detected:', img.src);
          img.src = this.defaultImage;
        }
      });
    }, 0); // Runs in next tick to catch rendered images
  }
}