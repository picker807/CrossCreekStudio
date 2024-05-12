import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/authentication/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Gallery, GalleryCategory } from '../gallery.model';
import { GalleryService } from '../gallery.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cc-gallery-edit',
  templateUrl: './gallery-edit.component.html',
  styleUrls: ['./gallery-edit.component.css']
})
export class GalleryEditComponent implements OnInit {
  imageSrc: string;
  isAdmin: boolean = false;
  galleryForm: FormGroup;
  GalleryCategory = GalleryCategory;
  editMode: boolean = false;
  originalItem: Gallery;
  currentImageUrl: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private galleryService: GalleryService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    }));

    this.galleryForm = this.fb.group({
      name: [''],
      description: [''],
      category: [''],
      imageUrl: ['']
    });

    this.subscriptions.add(this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.subscriptions.add(this.galleryService.galleryList$.subscribe(list => {
          this.originalItem = list.find(item => item.id === id);
          if (this.originalItem) {
            this.editMode = true;
            this.currentImageUrl = this.originalItem.imageUrl;
            this.updateForm();
          } else {
            this.editMode = false;
          }
        }));
      }
    }));
  }

  onImageSrcChange(newImageSrc: string): void {
    console.log('New image source:', newImageSrc);
    this.currentImageUrl = newImageSrc;
    this.galleryForm.patchValue({
      imageUrl: newImageSrc
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateForm(): void {
    this.galleryForm.patchValue({
      name: this.originalItem.name,
      description: this.originalItem.description,
      category: this.originalItem.category,
      imageUrl: this.currentImageUrl
    });
  }

  submitEdit(): void {

    if (this.galleryForm.valid) {
      console.log('Form Data:', this.galleryForm.value);
      const value = this.galleryForm.value;
      const newItem: Gallery = {
        ...value,
      };

    if (this.editMode) {
      this.galleryService.updateGalleryItem(this.originalItem, newItem);
    } else {
      this.galleryService.createGalleryItem(newItem);
    }
    }
  }


  cancelEdit(): void {

  }
    
}
 
