import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AuthGuard } from '../../core/authentication/auth.guard';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: AdminLoginComponent }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }