import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StringFilterPipe } from './string-filter.pipe';



@NgModule({
  declarations: [
    StringFilterPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    StringFilterPipe
  ]
})
export class SharedModule { }
