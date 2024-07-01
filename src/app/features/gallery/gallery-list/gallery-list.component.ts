import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Gallery, GalleryCategory } from '../gallery.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/authentication/auth.service';
import { GalleryService } from '../gallery.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'cc-gallery-list',
  templateUrl: './gallery-list.component.html',
  styleUrl: './gallery-list.component.css'
})
export class GalleryListComponent implements OnInit, OnDestroy{
  isAdmin = false; // This should come from an authentication service
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
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
   /*  this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    }); */

    

    this.selectedCategory = this.categories[0]; // Load the first category by default
    this.loadCategoryItems(this.selectedCategory);

    this.subscription = this.galleryService.galleryList$.subscribe((galleryList: Gallery[]) => {
      this.galleryList = galleryList;
      //this.groupItemsByCategory();
    });
  }



 

  onTabChange(event: any): void {
    const selectedCategory = this.categories[event.index];
    this.selectedCategory = selectedCategory;
    this.loadCategoryItems(selectedCategory);
  }

  private loadCategoryItems(category: string): void {
    if (!this.categoryItems[category]) {
      this.galleryService.getGalleryItemsByCategory(category).subscribe(items => {
        //console.log(`Loaded items for category ${category}:`, items);
        this.categoryItems[category] = items;
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
    this.subscription.unsubscribe();
  }

  search (value: string) {
    this.term = value;
  }

  newItem(): void {
    this.router.navigate(['/gallery/new']);
  }

  
}
