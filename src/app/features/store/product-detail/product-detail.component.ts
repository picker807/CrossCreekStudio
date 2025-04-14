import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CheckoutService } from '../../../services/checkout.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'cc-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1; // Default quantity
  loading: boolean = true;
  error: string | null = null;
  currentImageIndex: number = 0;

 

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private checkoutService: CheckoutService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('productId');
      //console.log('Product ID from paramMap:', productId);
      if (productId) {
        this.loadProduct(productId);
      } else {
        this.error = 'Product ID not found';
        this.loading = false;
      }
    });
  }

  loadProduct(productId: string): void {
    this.productService.getProductById(productId).subscribe({
      next: (product: Product) => {
        this.product = product;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching product:', err);
        this.error = 'Failed to load product details';
        this.loading = false;
      }
    });
  }

  adjustQuantity(change: number): void {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= (this.product?.stock || Infinity)) {
      this.quantity = newQuantity;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.checkoutService.addProductToCart([{ productId: this.product.id, quantity: this.quantity }])
        .subscribe({
          next: () => {
            //console.log(`${this.quantity} of ${this.product?.name} added to cart`);
            // Optionally reset quantity or show a success message
          },
          error: (err) => {
            console.error('Error adding to cart:', err);
            this.error = 'Failed to add to cart';
          }
        });
    }
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
  }

 /*  nextImage(): void {
    if (this.product && this.product.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length;
    }
  }
  
  prevImage(): void {
    if (this.product && this.product.images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.product.images.length) % this.product.images.length;
    }
  } */
}
