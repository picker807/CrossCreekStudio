import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Gallery, GalleryCategory } from '../gallery.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/authentication/authentication.service';
import { GalleryService } from '../gallery.service';

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
  galleryCategories = GalleryCategory;
  groupedItems: { [key: string]: any[] } = {};

  constructor(private router: Router,
    private galleryService: GalleryService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });

    this.subscription = this.galleryService.galleryList$.subscribe((galleryList: Gallery[]) => {
      this.galleryList = galleryList;
      this.groupItemsByCategory();
      this.router.navigate(['/gallery']);
    });
  }

  private groupItemsByCategory(): void {
    this.groupedItems = this.galleryList.reduce((acc, item) => {
      const categoryKey = item.category;
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      acc[categoryKey].push(item);
      return acc;
    }, {});
  }
 
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
