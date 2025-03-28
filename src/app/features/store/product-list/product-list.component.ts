import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CheckoutService } from '../../../services/checkout.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { ProductService } from '../../../services/product.service';

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
    //private http: HttpClient,
    private checkoutService: CheckoutService,
    private router: Router,
    private messageService: MessageService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.messageService.showMessage({ text: 'Failed to load products', type: 'error', duration: 3000 });
      }
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
      next: () => {
        const product = this.products.find(p => p.id === productId);
        const messageText = product ? `Added ${product.name} to cart` : `Added product to cart`;
        this.messageService.showMessage({ text: messageText, type: 'success', duration: 3000 });
      },
      error: (error) => {
        console.error('Error adding to cart:', error)
        this.messageService.showMessage({ text: 'Failed to add product to cart', type: 'error', duration: 3000 });
      }
    });
  }

  goToDetail(productId: string): void {
    this.router.navigate(['/store', productId]);
  }
}
