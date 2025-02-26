// app-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CartComponent } from './features/checkout/cart/cart.component';
import { ConfirmationComponent } from './features/checkout/confirmation/confirmation.component';
import { PageNotFoundComponent } from './features/page-not-found/page-not-found.component';
import { ContactComponent } from './features/contact/contact.component';


const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'events', loadChildren: () => import('./features/events/events.module').then(m => m.EventsModule) },
  { path: 'admin', loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule) },
  { path: 'home', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)},
  { path: 'gallery', loadChildren: () => import('./features/gallery/gallery.module').then(m => m.GalleryModule)},
  { path: 'cart', component: CartComponent },
  { path: 'confirmation', component: ConfirmationComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'store', loadChildren: () => import('./features/store/product-store.module').then(m => m.ProductStoreModule) },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
