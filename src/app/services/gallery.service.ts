import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { Gallery } from '../models/gallery.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private apiUrl = `${environment.SITE_URL}/api/galleries`;
  private galleryList: Gallery[] = [];
  private galleryListSubject = new BehaviorSubject<Gallery[]>([]);
  public galleryList$ = this.galleryListSubject.asObservable();
  private selectedCategoryIndex: number = 0;

  constructor(private http: HttpClient){}

  private sortGalleryList(galleries: Gallery[]): Gallery[] {
    return galleries.sort((a, b) => a.name.localeCompare(b.name));
  }

  getGalleryItemsByCategory(category: string): Observable<Gallery[]> {
    return this.http.get<{ galleries: Gallery[] }>(`${this.apiUrl}?category=${category}`)
      .pipe(
        map(response => this.sortGalleryList(response.galleries)),
        tap(galleries => {
          this.galleryList = this.sortGalleryList([...this.galleryList, ...galleries]);
          this.galleryListSubject.next(this.galleryList);
        })
      );
  }

  loadAllData(): Observable<Gallery[]> {
    return this.http.get<{galleries: Gallery[]}>(this.apiUrl).pipe(
      map(response => this.sortGalleryList(response.galleries)),
      tap(galleries => {
        this.galleryList = this.sortGalleryList(galleries);
        this.galleryListSubject.next(this.galleryList);
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
        
      }),
      catchError(error => {
        console.error('Error deleting gallery item:', error);
        return throwError(() => new Error('Error deleting gallery item'));
      })
    );
  }

 uploadFile(file: File, key: string): Observable<{ imageUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('key', key);
  console.log("Form Data in Gallery uploadFile: ", formData);
  const token = localStorage.getItem('token');
  console.log('UploadFile - Token:', token || 'No token');
  if (!token) {
    console.error('UploadFile - No token found in localStorage');
  }
  const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  console.log('UploadFile - Headers:', headers);
  return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload`, formData, { headers });
}

  getSelectedCategoryIndex(): number {
    return this.selectedCategoryIndex;
  }

  setSelectedCategoryIndex(index: number): void {
    this.selectedCategoryIndex = index;
  }

}