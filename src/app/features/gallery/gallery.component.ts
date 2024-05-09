import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'cc-gallery',
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  //showModal: boolean = false;
  selectedItem: any = null;
  //isSmallScreen: boolean = false;
  isModalOpen: boolean = false;
  private lastScrollTop: number = 0;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.setModal(event.urlAfterRedirects);
    });
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.lastScrollTop = window.scrollY;
  }

  @HostListener('window:resize')
    onResize() {
    this.setModal(this.router.url);
  }

  setModal(currentUrl: string): void {
    const isModalRoute = ['/gallery/detail', '/gallery/edit'].some(path => currentUrl.includes(path));
    this.isModalOpen = this.isSmallScreen() && isModalRoute;
  }

  private isSmallScreen(): boolean {
    return window.innerWidth < 768;
  }

/*private checkScreenSize() {
  this.isSmallScreen = window.innerWidth < 768; // Example breakpoint
} */

  openModal(item: any): void {
    this.selectedItem = item;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedItem = null;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      // Navigate back to the desired route
      this.router.navigate(['/gallery']);
    });
    setTimeout(() => this.restoreScrollPosition(), 100);
  }

  private restoreScrollPosition(): void {
    window.scrollTo(0, this.lastScrollTop);
  }
}
