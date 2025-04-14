import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Gallery, GalleryCategory } from '../../../models/gallery.model';
import { Subscription } from 'rxjs';
import { GalleryService } from '../../../services/gallery.service';
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
  
  
  galleryList: Gallery[] = [];
  term: string;
  private subscription: Subscription;
  selectedCategory: string;
  categories = Object.keys(GalleryCategory);
  categoryItems: { [key: string]: Gallery[] } = {};
  selectedTabIndex: number;
  isDragEnabled: boolean = false;


  constructor(
    private router: Router,
    private galleryService: GalleryService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {

    this.isDragEnabled = this.router.url.includes('/events');

    this.selectedTabIndex = this.galleryService.getSelectedCategoryIndex();
    this.selectedCategory = this.categories[this.selectedTabIndex];
    this.loadCategoryItems(this.selectedCategory);
    //console.log("loaded category items: ", this.categoryItems);
    

    this.subscription = this.galleryService.galleryList$.subscribe({
      next: (galleryList: Gallery[]) => {
        this.galleryList = galleryList;
        this.galleriesLoaded.emit(this.galleryList);
        this.updateCategoryItems();
        //console.log('Updated Category Items:', this.categoryItems);
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
    this.selectedTabIndex = event.index;
    this.galleryService.setSelectedCategoryIndex(this.selectedTabIndex);
    const selectedCategory = this.categories[event.index];
    this.selectedCategory = selectedCategory;
    this.loadCategoryItems(selectedCategory);
  }

  private loadCategoryItems(category: string): void {
    if (!this.categoryItems[category]) {
      this.galleryService.getGalleryItemsByCategory(category).subscribe({
        next: (items) => {
          
          //console.log("Items Sorted? ", items);
          this.categoryItems[category] = items;
          //console.log("Category items in component loadCategoryItmes: ", this.categoryItems);
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

  private updateCategoryItems(): void {
    this.categoryItems = this.galleryList.reduce((acc, item) => {
      const category = item.category; 
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }
 
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
