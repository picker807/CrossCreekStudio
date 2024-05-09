import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Gallery } from '../gallery.model';
import { GalleryService } from '../gallery.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../../core/authentication/authentication.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'cc-gallery-detail',
  templateUrl: './gallery-detail.component.html',
  styleUrl: './gallery-detail.component.css'
})
export class GalleryDetailComponent implements OnInit, OnDestroy {
item: Gallery;
isAdmin: boolean = false;
private subscriptions: Subscription = new Subscription();

constructor(
  private galleryService: GalleryService,
  private authService: AuthService,
  private router: Router,
  private route: ActivatedRoute
) {
  this.subscriptions.add(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadItemDetails();
    })
  );
}

ngOnInit(): void {
  this.subscriptions.add(this.authService.isAdmin$.subscribe(isAdmin => {
    this.isAdmin = isAdmin;
  }));
  this.loadItemDetails();

 /* this.subscriptions.add(this.route.params.subscribe(params => {
    const id = params['id'];
    if (id) {
      this.subscriptions.add(this.galleryService.galleryList$.subscribe(list => {
        this.item = list.find(item => item.id === id);
      }));
    }
  }));
  */
}

ngOnDestroy(): void {
  this.subscriptions.unsubscribe();
}

private loadItemDetails(): void {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.item = this.galleryService.getItemById(id);
  }
}

editItem(itemId: string): void {
  if (window.innerWidth < 768) {
    this.router.navigate(['/gallery/modal-edit', itemId]);
  } else {
    this.router.navigate(['/gallery/edit', itemId]);
  }
}

deleteItem(id: string): void {
  this.galleryService.deleteGalleryItem(id);
  //this.item = null;
  this.router.navigate(['/gallery']);
}

}