import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CheckoutService } from '../../../services/checkout.service';
import { Router } from '@angular/router';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
}

@Component({
  selector: 'cc-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';

  constructor(
    private http: HttpClient,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.http.get<Product[]>('/api/products').subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
      },
      error: (error) => console.error('Error loading products:', error)
    });
  }

  filterProducts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(term)
    );
  }

  addToCart(productId: string): void {
    const productForCart = [{
      productId: productId,
      quantity: 1
    }];
    this.checkoutService.addProductToCart(productForCart).subscribe({
      next: () => console.log(`Added product ${productId} to cart`),
      error: (error) => console.error('Error adding to cart:', error)
    });
  }

  goToDetail(productId: string): void {
    this.router.navigate(['/store', productId]);
  }
}
