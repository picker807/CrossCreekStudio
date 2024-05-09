import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryDetailComponent } from './gallery-detail/gallery-detail.component';
import { GalleryEditComponent } from './gallery-edit/gallery-edit.component';
import { GalleryItemComponent } from './gallery-item/gallery-item.component';
import { GalleryListComponent } from './gallery-list/gallery-list.component';
import { GalleryRoutingModule } from './gallery-routing.module';
import { GalleryComponent } from './gallery.component';
import { SharedModule } from "../../shared/shared.module";




@NgModule({
    declarations: [
        GalleryListComponent,
        GalleryEditComponent,
        GalleryDetailComponent,
        GalleryItemComponent,
        GalleryComponent
    ],
    imports: [
        CommonModule,
        GalleryRoutingModule,
        SharedModule
    ]
})
export class GalleryModule { }
