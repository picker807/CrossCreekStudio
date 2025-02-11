import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StringFilterPipe } from './string-filter.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { PhoneFormatPipe } from './phone-format.pipe';



@NgModule({
  declarations: [
    StringFilterPipe,
    ConfirmationDialogComponent,
    PhoneFormatPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    DragDropModule,
  
  ],
  exports: [
    StringFilterPipe,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    DragDropModule,
    PhoneFormatPipe
  
    
  ]
})
export class SharedModule { }
