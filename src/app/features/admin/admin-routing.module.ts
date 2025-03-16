import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { authGuard } from '../../core/authentication/auth.guard';
import { AdminProductsComponent } from './admin-products/admin-products.component';

const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  { path: '', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: 'products', component: AdminProductsComponent, canActivate: [authGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }