import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Gallery, GalleryCategory } from './gallery.model';
import data from '../../../../MOCK_GALLERY_DATA.json';


@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private galleryList: Gallery[] = [];
  private maxGalleryId: number = 100;
  private galleryListChangedEvent = new BehaviorSubject<Gallery[]>([]);
  public galleryList$ = this.galleryListChangedEvent.asObservable();

  constructor(){
    this.loadInitialData();
  }

  private loadInitialData(): void {
    if (this.galleryList.length === 0) {
      this.galleryList = data.map(item => ({
        ...item,
        category: GalleryCategory[item.category as keyof typeof GalleryCategory]  // Convert string to enum
      }));
      this.sortAndSend();
    }
   
  }

  getItemById(id: string): Gallery {
    
    const item = this.galleryList.find(event => event.id === id);
    
    return item;
  }

  sortAndSend(): void {
    this.galleryListChangedEvent.next(this.galleryList.slice());
  }

  createGalleryItem(gallery: Gallery): void {
    gallery.id = this.maxGalleryId.toString();
    this.maxGalleryId += 1;
    this.galleryList.push(gallery);
    this.sortAndSend();
  }

  updateGalleryItem(originalGallery: Gallery, newGallery: Gallery): void {
    if (originalGallery === undefined || originalGallery === null || newGallery === undefined || newGallery === null) {
      return;
    }

    const pos = this.galleryList.indexOf(originalGallery);
    if (pos < 0) {
      return;
    }

    newGallery.id = originalGallery.id;
    this.galleryList[+pos] = newGallery;

    this.sortAndSend();
  }

  deleteGalleryItem(id: string): void {
    console.log("ID at gallery service delete: ", id);
    const index = this.galleryList.findIndex(item => item.id === id);
    console.log("Before delete: ", this.galleryList.length)
    if (index !== -1) {
      this.galleryList.splice(index, 1);
      console.log("After delete: ", this.galleryList.length)
      this.sortAndSend();
    } else {
      console.error('Gallery item not found');
    }
    
  }

}