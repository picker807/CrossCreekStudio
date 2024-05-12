import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageUploadService } from '../image-upload.service';
import { NgxFileDropEntry } from '@bugsplat/ngx-file-drop';

@Component({
  selector: 'cc-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.css',
})
export class ImageUploadComponent {
  //@Input() imageSrc: string;
  @Output() imageSrcChange = new EventEmitter<string>();
  imageSrc: string | null = null;

  constructor(private imageUploadService: ImageUploadService) {}

 /*
  get imageSrc(): string | ArrayBuffer | null {
    return this.imageUploadService.imageSrc;
  }
  */

  processFile(file: File) {
    this.imageUploadService.convertFileToDataURL(file).then(dataURL => {
      this.imageSrc = dataURL;
      this.imageSrcChange.emit(dataURL);
    }).catch(error => {
      console.error('Error converting file:', error);
    });
  }
  
  handleFileInput(event: any) {
    if (event.target && event.target.files && event.target.files.length > 0) {
      const file: File = event.target.files[0];
      this.processFile(file);
    } else {
      console.warn('Invalid event or no files selected.');
    }
  }

  onDragOver(event: Event) {
    event.preventDefault();
  }

  onDrop(event: any) {
    console.log('Drop event triggered');
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file: File = event.dataTransfer.files[0];
      this.processFile(file);
    } else {
      console.warn('Invalid drop event or no files selected.');
    }
  }

 /*
  onFilesDropped(files: NgxFileDropEntry[]) {
    // Handle the dropped files here
    console.log('Dropped files:', files);
    // You can perform additional operations like uploading the files
  } */
}
