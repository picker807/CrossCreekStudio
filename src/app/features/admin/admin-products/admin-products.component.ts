import { Component, OnInit } from '@angular/core';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, map, Observable, of } from 'rxjs';

@Component({
  selector: 'cc-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css'
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  createForm: FormGroup;
  selectedFiles: File[] = [];
  editSelectedFiles: { [key: string]: File[] } = {};
  previews: string[] = [];
  editPreviews: { [key: string]: string[] } = {};
  editForms: { [key: string]: FormGroup } = {};
  taxRate: number = 0;
  shippingRate: number = 0;
  editingConfig: boolean = false;
  loading: boolean = false;
  expandedProductIds: Set<string> = new Set();
  error: string | null = null;

  constructor(private productService: ProductService, private fb: FormBuilder) {
    this.createForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [ Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      images: [[]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadConfig();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProductsAdmin().subscribe({
      next: (products) => {
        this.products = products;
        this.products.forEach(p => this.initEditForm(p));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadConfig(): void {
    this.productService.getConfig().subscribe({
      next: (config) => {
        this.taxRate = config.taxRate;
        this.shippingRate = config.shippingRate;
      },
      error: (err) => console.error('Failed to load config:', err)
    });
  }

  initEditForm(product: Product): void {
    this.editForms[product.id] = this.fb.group({
      id: [product.id, [Validators.required, Validators.pattern(/^\d+$/)]],
      name: [product.name, [Validators.required, Validators.minLength(2)]],
      price: [product.price, [Validators.required, Validators.min(0)]],
      stock: [product.stock, [Validators.required, Validators.min(0)]],
      description: [product.description, [Validators.required, Validators.minLength(10)]],
      images: [product.images || []]
    });
  }

  toggleExpand(productId: string): void {
    if (this.expandedProductIds.has(productId)) {
      this.expandedProductIds.delete(productId);
    } else {
      this.expandedProductIds.add(productId);
    }
  }

  onFileDrop(event: DragEvent, form: FormGroup, productId?: string): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) this.handleFiles(files, form, productId);
  }

  onFileBrowse(event: Event, form: FormGroup, productId?: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.handleFiles(input.files, form, productId);
  }

  handleFiles(files: FileList, form: FormGroup, productId?: string): void {
    const fileArray = Array.from(files);
    if (productId) {
      this.editSelectedFiles[productId] = [...(this.editSelectedFiles[productId] || []), ...fileArray];
      this.updatePreviews(this.editSelectedFiles[productId], productId);
    } else {
      this.selectedFiles = [...this.selectedFiles, ...fileArray];
      this.updatePreviews(this.selectedFiles);
    }
  }

  updatePreviews(files: File[], productId?: string): void {
    const previews = files.map(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise<string>(resolve => reader.onload = () => resolve(reader.result as string));
    });
    Promise.all(previews).then(results => {
      if (productId) this.editPreviews[productId] = results;
      else this.previews = results;
    });
  }

  removeFile(index: number, productId?: string): void {
    if (productId) {
      this.editSelectedFiles[productId].splice(index, 1);
      this.editPreviews[productId].splice(index, 1);
    } else {
      this.selectedFiles.splice(index, 1);
      this.previews.splice(index, 1);
    }
  }

  generateUniqueKey(fileName: string): string {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${randomString}_${fileName}`;
  }
  
  uploadFiles(files: File[]): Observable<string[]> {
    if (!files.length) return of([]);
    const uploadObservables = files.map(file => {
      const key = this.generateUniqueKey(file.name);
      return this.productService.uploadFile(file, key).pipe(
        map(response => response.imageUrl)
      );
    });
    return forkJoin(uploadObservables);
  }

  removeImage(form: FormGroup, index: number): void {
    const images = form.get('images')?.value || [];
    images.splice(index, 1);
    form.patchValue({ images });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  createProduct(): void {
    if (this.createForm.valid) {
      this.loading = true;
      this.uploadFiles(this.selectedFiles).subscribe({
        next: (newUrls) => {
          const productData = { ...this.createForm.value, images: [...this.createForm.value.images, ...newUrls] };
          this.productService.createProduct(productData).subscribe({
            next: () => {
              this.loadProducts();
              this.createForm.reset({ id: '', name: '', price: 0, stock: 0, description: '', images: [] });
              this.selectedFiles = [];
              this.previews = [];
              this.loading = false;
            },
            error: () => (this.loading = false)
          });
        },
        error: () => (this.loading = false)
      });
    }
  }

  updateProduct(productId: string): void {
    if (this.editForms[productId].valid) {
      this.loading = true;
      const newFiles = this.editSelectedFiles[productId] || [];
      this.uploadFiles(newFiles).subscribe({
        next: (newUrls) => {
          const productData = { ...this.editForms[productId].value, images: [...this.editForms[productId].value.images, ...newUrls] };
          this.productService.updateProduct(productId, productData).subscribe({
            next: () => {
              this.loadProducts();
              delete this.editSelectedFiles[productId];
              delete this.editPreviews[productId];
              this.loading = false;
            },
            error: () => (this.loading = false)
          });
        },
        error: () => (this.loading = false)
      });
    }
  }

  deleteProduct(productId: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to delete product';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  updateConfig(): void {
    this.loading = true;
    this.productService.updateConfig({ taxRate: this.taxRate, shippingRate: this.shippingRate }).subscribe({
      next: () => {
        this.editingConfig = false;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to update settings';
        this.loading = false;
        console.error(err);
      }
    });
  }
}