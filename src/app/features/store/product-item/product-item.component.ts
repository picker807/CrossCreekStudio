import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'cc-product-item',
  templateUrl: './product-item.component.html',
  styleUrls: ['./product-item.component.css']
})
export class ProductItemComponent {
  @Input() product: any;
  @Output() addToCart = new EventEmitter<string>();
  @Output() viewDetails = new EventEmitter<string>();

  onAddToCart(): void {
    this.addToCart.emit(this.product.id);
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.product.id);
  }
}