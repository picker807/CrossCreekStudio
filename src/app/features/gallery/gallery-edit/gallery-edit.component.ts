import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Gallery, GalleryCategory } from '../../../models/gallery.model';
import { GalleryService } from '../../../services/gallery.service';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'cc-gallery-edit',
  templateUrl: './gallery-edit.component.html',
  styleUrls: ['./gallery-edit.component.css']
})
export class GalleryEditComponent implements OnInit {
  imageSrc: string;
  galleryForm: FormGroup;
  GalleryCategory = GalleryCategory;
  editMode: boolean = false;
  originalItem: Gallery;
  currentImageUrl: string;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private galleryService: GalleryService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    

    this.galleryForm = this.fb.group({
      name: [''],
      description: [''],
      category: [''],
      imageUrl: ['']
    });

    this.subscriptions.add(this.route.params.subscribe(params => {
      const id = params['id'];
      console.log(id);
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Create a FileReader to read the file and show a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
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
    this.currentImageUrl = this.originalItem.imageUrl;
  }

  submitEdit(): void {
    if (this.galleryForm.valid) {
      const value = this.galleryForm.value;
      const newItem: Gallery = {
        ...value,
      };
  
      // Check if a file is selected for upload
      if (this.selectedFile) {
        const key = this.generateUniqueKey(this.selectedFile.name);
  
        // Upload the file and wait for the response
        this.galleryService.uploadFile(this.selectedFile, key).subscribe({
          next: (response) => {
            console.log("response from uploadFile: ", response);
            // Update the image URL in the form with the new URL from the response
            this.currentImageUrl = response.imageUrl;
            newItem.imageUrl = response.imageUrl;
            this.galleryForm.patchValue({ imageUrl: this.currentImageUrl });

            // Proceed with creating or updating the gallery item
            this.saveGalleryItem(newItem);
          },
          error: (error) => {
            console.error('Error uploading file:', error);
            this.messageService.showMessage({
              text: 'There was a problem uploading the image.',
              type: 'error',
              duration: 5000
            });
          }
        });
      } else {
        // No file selected, proceed with creating or updating the gallery item
        this.saveGalleryItem(newItem);
      }
    }
  }
  
  saveGalleryItem(newItem: Gallery): void {
    if (this.editMode) {
      this.galleryService.updateGalleryItem(this.originalItem, newItem)
        .subscribe({
          next: (updatedItem) => {
            this.messageService.showMessage({
              text: 'Item updated successfully.',
              type: 'success',
              duration: 5000
            });
            this.router.navigate(['/gallery/detail', updatedItem.id]);
          },
          error: (error) => {
            console.error('Error updating gallery item:', error);
            this.messageService.showMessage({
              text: 'There was a problem when attempting to update this item.',
              type: 'error',
              duration: 5000
            });
          }
        });
    } else {
      this.galleryService.createGalleryItem(newItem)
        .subscribe({
          next: (updatedItem) => {
            this.messageService.showMessage({
              text: 'Item created successfully',
              type: 'success',
              duration: 5000
            });
            this.router.navigate(['gallery/detail', updatedItem.id]);
          },
          error: (error) => {
            console.error('Error creating new gallery item', error);
            this.messageService.showMessage({
              text: 'There was a problem when attempting to create this item.',
              type: 'error',
              duration: 5000
            });
          }
        });
    }
  }

  generateUniqueKey(fileName: string): string {
    return `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  }

  cancelEdit(): void {
    if (this.originalItem){
      this.router.navigate(['/gallery/detail', this.originalItem.id]);
    } else {
      this.router.navigate(['/gallery']);
    }
  }
    
}
 
