import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable, throwError, of } from 'rxjs';
import { Gallery, GalleryCategory } from '../models/gallery.model';
//import data from '../../../../MOCK_GALLERY_DATA.json';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private apiUrl = 'http://localhost:3000/galleries';
  private galleryList: Gallery[] = [];
  private galleryListSubject = new BehaviorSubject<Gallery[]>([]);
  public galleryList$ = this.galleryListSubject.asObservable();

  constructor(private http: HttpClient){}

  getGalleryItemsByCategory(category: string): Observable<Gallery[]> {
    return this.http.get<{ galleries: Gallery[] }>(`${this.apiUrl}?category=${category}`)
      .pipe(
        map(response => response.galleries),
        tap(galleries => {
          this.galleryList = [...this.galleryList, ...galleries];
          this.galleryListSubject.next(this.galleryList);
        })
      );
  }

  loadAllData(): Observable<Gallery[]> {
    return this.http.get<{galleries: Gallery[]}>(this.apiUrl).pipe(
      map (response => response.galleries),
      tap(galleries => {
        this.galleryListSubject.next(galleries);
      }),
      
      catchError(error => {
        console.error('Error loading gallery items:', error);
        return throwError(() => new Error('Error loading gallery items'));
      })
    );
  } 


  getItemById(id: string): Observable<Gallery> {
    const currentItems = this.galleryListSubject.getValue();
    const item = currentItems.find(gallery => gallery.id === id);
    if (item) {
      return of(item);
    } else {
      return this.http.get<Gallery>(`${this.apiUrl}/${id}`);
    }
  }

  createGalleryItem(gallery: Gallery): Observable<Gallery> {
    gallery.id = '';
    //console.log("item in createGalleryItem: ", gallery);
    return this.http.post<Gallery>(this.apiUrl, gallery).pipe(
      tap(newGallery => {
        //console.log("newly created gallery item: ", newGallery);
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
    //console.log("updating gallery item in updateGalleryItem: ", newGallery);
    newGallery.id = originalGallery.id;
    return this.http.put<Gallery>(`${this.apiUrl}/${newGallery.id}`, newGallery).pipe(
      tap(updatedGallery => {
        //console.log("updated gallery after http.put: ", updatedGallery);
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

}