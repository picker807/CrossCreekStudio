import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryDetailComponent } from './gallery-detail/gallery-detail.component';
import { GalleryEditComponent } from './gallery-edit/gallery-edit.component';
import { GalleryItemComponent } from './gallery-item/gallery-item.component';
import { GalleryListComponent } from './gallery-list/gallery-list.component';
import { GalleryRoutingModule } from './gallery-routing.module';
import { GalleryComponent } from './gallery.component';
import { SharedModule } from "../../core/shared/shared.module";
import { TabComponent } from './tab/tab.component';
import { TabsComponent } from './tabs/tabs.component';
import { MatTabsModule } from '@angular/material/tabs';




@NgModule({
    declarations: [
        GalleryListComponent,
        GalleryEditComponent,
        GalleryDetailComponent,
        GalleryItemComponent,
        GalleryComponent,
        TabComponent,
        TabsComponent
    ],
    imports: [
        CommonModule,
        GalleryRoutingModule,
        SharedModule,
        MatTabsModule
    ],
    exports: [
        GalleryListComponent
    ]
})
export class GalleryModule { }
