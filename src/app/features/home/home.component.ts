import { Component, ElementRef, ViewChild } from '@angular/core';
import { GalleryService } from '../../services/gallery.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { Router } from '@angular/router';

@Component({
  selector: 'cc-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  currentSeason: string;
  eventImages: string[] = [];
  products: Product[] = [];

  visibleImages: (string | null)[] = [null, null, null];
  currentIndex = 0;
  private intervalId: any;
  private imageTransforms: Map<string | null, { x: number; y: number; rotate: number }> = new Map();

  @ViewChild('paradeTrack', { static: false }) paradeTrack!: ElementRef;

  constructor(
    private galleryService: GalleryService,
    private productService: ProductService,
    private router: Router
  ) {
    
  }

  ngOnInit() {
    this.currentSeason = this.getCurrentSeason();
    this.loadCategoryItems(this.currentSeason);
    this.loadProducts();
    this.startPolaroidCycle();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
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
          this.eventImages = items.map(item => item.imageUrl);
        }
      });
  }

  private loadProducts(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.products = products;
      setTimeout(() => this.startParade(), 0);
    });
  }

  startParade(): void {
    const track = this.paradeTrack.nativeElement as HTMLElement;
    const container = track.parentElement as HTMLElement;
    const containerWidth = container.offsetWidth;
    let position = 0;
    const speed = 0.5; // Slower speed as you adjusted
    const fadeWidth = 128; // Matches w-32

    // Ensure enough images to fill screen
    const imageWidth = 192; // Matches w-48 (adjust if you change width)
    const gap = 8; // Matches gap-2 (0.5rem = 8px at default font size)
    const totalWidth = imageWidth + gap;
    const minImages = Math.ceil(containerWidth / totalWidth) + 2;

    if (this.products.length < minImages) {
      const clonesNeeded = minImages - this.products.length;
      for (let i = 0; i < clonesNeeded; i++) {
        const clone = track.children[i % this.products.length].cloneNode(true) as HTMLElement;
        track.appendChild(clone);
      }
    }

    const scroll = () => {
      position -= speed;
      track.style.transform = `translateX(${position}px)`;

      if (Math.abs(position) >= totalWidth) {
        const firstImage = track.firstElementChild as HTMLElement;
        track.appendChild(firstImage);
        position += totalWidth; // Exact adjustment
        track.style.transform = `translateX(${position}px)`;
      }

      requestAnimationFrame(scroll);
    };

    requestAnimationFrame(scroll);
  }

  startPolaroidCycle(): void {
    this.intervalId = setInterval(() => {
      // Shift stack
      this.visibleImages[2] = this.visibleImages[1];
      this.visibleImages[1] = this.visibleImages[0];
      const newImage = this.eventImages[this.currentIndex];
      this.visibleImages[0] = newImage;
  
      // Set transform for new top card only
      if (!this.imageTransforms.has(newImage)) {
        this.imageTransforms.set(newImage, {
          x: this.getRandomOffset(),
          y: 0, // Initial drop position
          rotate: this.getRandomRotation()
        });
      }
  
      // Update Y positions for middle and bottom as they shift
      if (this.visibleImages[1]) {
        const middleTransform = this.imageTransforms.get(this.visibleImages[1])!;
        middleTransform.y = 15; // Fixed middle position
      }
      if (this.visibleImages[2]) {
        const bottomTransform = this.imageTransforms.get(this.visibleImages[2])!;
        bottomTransform.y = 30; // Fixed bottom position
      }
  
      this.currentIndex = (this.currentIndex + 1) % this.eventImages.length;
    }, 3000);
  }
  
  getDropTransform(image: string | null): string {
    const transform = this.imageTransforms.get(image) || { x: 0, y: 0, rotate: 0 };
    return `translate(${transform.x}px, ${transform.y}px)`;
  }
  
  getRotation(image: string | null): string {
    const transform = this.imageTransforms.get(image) || { x: 0, y: 0, rotate: 0 };
    return `${transform.rotate}deg`;
  }
  
  getRandomRotation(): number {
    return Math.random() * 10 - 5; // -5 to 5 degrees
  }
  
  getRandomOffset(): number {
    return Math.random() * 20 - 10; // -10 to 10 pixels
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
} 


