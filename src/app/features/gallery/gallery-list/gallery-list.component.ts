import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Gallery, GalleryCategory } from '../../../models/gallery.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/authentication/auth.service';
import { GalleryService } from '../../../services/gallery.service';
import { isPlatformBrowser } from '@angular/common';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'cc-gallery-list',
  templateUrl: './gallery-list.component.html',
  styleUrl: './gallery-list.component.css'
})
export class GalleryListComponent implements OnInit, OnDestroy{
  //@Input() galleries: Gallery[];
  @Input() cdkDropListConnectedTo: string[] = [];
  @Output() itemDropped = new EventEmitter<CdkDragDrop<Gallery[]>>();
  @Output() galleriesLoaded = new EventEmitter<Gallery[]>();
  
  //isAdmin = false; // This should come from an authentication service
  galleryList: Gallery[] = [];
  term: string;
  private subscription: Subscription;
  //galleryCategories = GalleryCategory;
  //groupedItems: { [key: string]: any[] } = {};
  selectedCategory: string;
  categories = Object.keys(GalleryCategory);
  categoryItems: { [key: string]: Gallery[] } = {};

  //currentPage: number = 1;
  //itemsPerPage: number = 20;
  //hasMoreItems: boolean = true;


  constructor(private router: Router,
    private galleryService: GalleryService,
    //private authService: AuthService,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
   /*  this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    }); */

    

    this.selectedCategory = this.categories[0]; // Load the first category by default
    this.loadCategoryItems(this.selectedCategory);

    this.subscription = this.galleryService.galleryList$.subscribe({
      next: (galleryList: Gallery[]) => {
        this.galleryList = galleryList;
        this.galleriesLoaded.emit(this.galleryList);
      },
      error: (error) => {
        this.messageService.showMessage({
          text: 'Error loading gallery items. Please try again later.',
          type: 'error',
          duration: 5000
        });
      }
    });
    this.galleryService.loadAllData().subscribe({
      error: () => {
        this.messageService.showMessage({
          text: 'Error loading gallery data. Please refresh the page or try again later.',
          type: 'error',
          duration: 5000
        });
      }
    });
  }

  onDrop(event: CdkDragDrop<Gallery[]>) {
    this.itemDropped.emit(event);
  }

  onTabChange(event: any): void {
    const selectedCategory = this.categories[event.index];
    this.selectedCategory = selectedCategory;
    this.loadCategoryItems(selectedCategory);
  }

  private loadCategoryItems(category: string): void {
    if (!this.categoryItems[category]) {
      this.galleryService.getGalleryItemsByCategory(category).subscribe({
        next: (items) => {
          this.categoryItems[category] = items;
        },
        error: (error) => {
          this.messageService.showMessage({
            text: `Error loading items for ${category}. Please try again.`,
            type: 'error',
            duration: 5000
          });
        }
      });
    }
  }


   /* private groupItemsByCategory(): void {
    this.groupedItems = this.galleryList.reduce((acc, item) => {
      const categoryKey = item.category;
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      acc[categoryKey].push(item);
      return acc;
    }, {});
  } */
 
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  search (value: string) {
    this.term = value;
  }

  newItem(): void {
    this.router.navigate(['/gallery/new']);
  }

  
}
