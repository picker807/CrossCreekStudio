import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Gallery } from '../../../models/gallery.model';
import { GalleryService } from '../../../services/gallery.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../../core/authentication/auth.service';
import { Subscription, filter } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../core/shared/confirmation-dialog/confirmation-dialog.component';
import { MessageService } from '../../../services/message.service';

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
  private route: ActivatedRoute,
  private dialog: MatDialog,
  private messageService: MessageService
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
}

ngOnDestroy(): void {
  this.subscriptions.unsubscribe();
}

private loadItemDetails(): void {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.galleryService.getItemById(id).subscribe(item => {
      this.item = item;
    });
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
  const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    width: '300px',
    data: {
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this item?'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.galleryService.deleteGalleryItem(id).subscribe({
        next: () => {
          this.messageService.showMessage({
            text: 'Item deleted successfully',
            type: 'success',
            duration: 5000
          });
          this.router.navigateByUrl('/temporary-route', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/gallery']);
          });
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          this.messageService.showMessage({
            text: 'Problem deleting item',
            type: 'error',
            duration: 5000
          });
        }
      });
    } else {
      this.messageService.showMessage({
        text: 'Delete aborted',
        type: 'info',
        duration: 5000
      });
    }
  });
}

}