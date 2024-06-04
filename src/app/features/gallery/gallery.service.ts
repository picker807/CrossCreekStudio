import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable, throwError } from 'rxjs';
import { Gallery, GalleryCategory } from './gallery.model';
import data from '../../../../MOCK_GALLERY_DATA.json';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private apiUrl = 'http://localhost:3000/galleries';
  private galleryList: Gallery[] = [];
  private maxGalleryId: number = 100;
  private galleryListSubject = new BehaviorSubject<Gallery[]>([]);
  public galleryList$ = this.galleryListSubject.asObservable();

  constructor(private http: HttpClient){
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.http.get<Gallery[]>(this.apiUrl).subscribe(galleries => {
      const galleriesWithCategories = galleries.map(gallery => ({
        ...gallery,
        category: GalleryCategory[gallery.category as keyof typeof GalleryCategory]  // Convert string to enum
      }));
      this.galleryListSubject.next(galleriesWithCategories);
      //this.sortAndSend();
    });
  }


  getItemById(id: string): Observable<Gallery> {
    return this.galleryList$.pipe(
      map(galleries => galleries.find(gallery => gallery.id === id))
    );
  }

  /*sortAndSend(): void {
    this.galleryListChangedEvent.next(this.galleryList.slice());
  } */

  createGalleryItem(gallery: Gallery): Observable<Gallery> {
    gallery.id = this.generateUniqueId();
    return this.http.post<Gallery>(this.apiUrl, gallery).pipe(
      tap(newGallery => {
        const currentGalleries = this.galleryListSubject.getValue();
        this.galleryListSubject.next([...currentGalleries, newGallery]);
        //this.sortAndSend();
      }),
      catchError(error => {
        console.error('Error creating gallery item:', error);
        return throwError(() => new Error('Error creating gallery item'));
      })
    );
  }

  updateGalleryItem(originalGallery: Gallery, newGallery: Gallery): Observable<Gallery> {
    newGallery.id = originalGallery.id;
    return this.http.put<Gallery>(`${this.apiUrl}/${newGallery.id}`, newGallery).pipe(
      tap(updatedGallery => {
        const currentGalleries = this.galleryListSubject.getValue();
        const galleryIndex = currentGalleries.findIndex(g => g.id === originalGallery.id);
        currentGalleries[galleryIndex] = updatedGallery;
        this.galleryListSubject.next([...currentGalleries]);
        //this.sortAndSend();
      }),
      catchError(error => {
        console.error('Error updating gallery item:', error);
        return throwError(() => new Error('Error updating gallery item'));
      })
    );
  }

  deleteGalleryItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentGalleries = this.galleryListSubject.getValue();
        const updatedGalleries = currentGalleries.filter(gallery => gallery.id !== id);
        this.galleryListSubject.next(updatedGalleries);
        //this.sortAndSend();
      }),
      catchError(error => {
        console.error('Error deleting gallery item:', error);
        return throwError(() => new Error('Error deleting gallery item'));
      })
    );
  }

  private generateUniqueId(): string {
    return (this.maxGalleryId++).toString();
  }

}