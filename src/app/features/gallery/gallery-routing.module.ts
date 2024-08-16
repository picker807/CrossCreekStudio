// gallery-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GalleryComponent } from './gallery.component';
import { GalleryDetailComponent } from './gallery-detail/gallery-detail.component';
import { GalleryEditComponent } from './gallery-edit/gallery-edit.component';


const routes: Routes = [
  {
    path: '', component: GalleryComponent,
    children: [
      { path: '', redirectTo: '', pathMatch: 'full' },
      { path: 'new', component: GalleryEditComponent },
      { path: 'detail/:id', component: GalleryDetailComponent },
      { path: 'edit/:id', component: GalleryEditComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GalleryRoutingModule { }
