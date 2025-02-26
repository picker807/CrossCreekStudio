import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductStoreRoutingModule } from './product-store-routing.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductItemComponent } from './product-item/product-item.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { FormsModule } from '@angular/forms'; // For search input
import { CheckoutService } from '../../services/checkout.service'; // Assuming shared service

@NgModule({
  declarations: [
    ProductListComponent,
    ProductItemComponent,
    ProductDetailComponent,
    ProductEditComponent
  ],
  imports: [
    CommonModule,
    ProductStoreRoutingModule,
    FormsModule
  ],
  providers: [CheckoutService]
})
export class ProductStoreModule { }
