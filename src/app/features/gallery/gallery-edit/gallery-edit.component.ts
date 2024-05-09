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
  isAdmin: boolean = false;
  galleryForm: FormGroup;
  GalleryCategory = GalleryCategory;
  editMode: boolean = false;
  originalItem: Gallery;
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
            this.updateForm();
          } else {
            this.editMode = false;
          }
        }));
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateForm(): void {
    this.galleryForm.patchValue({
      name: this.originalItem.name,
      description: this.originalItem.description,
      category: this.originalItem.category,
      imageUrl: this.originalItem.imageUrl
    });
  }

  submitEdit(): void {

  }
  cancelEdit(): void {

  }
    
}
 
