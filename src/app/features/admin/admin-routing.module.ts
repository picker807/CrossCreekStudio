// admin-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { EventEditComponent } from '../events/event-edit/event-edit.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  
  { path: ':id/edit', component: EventEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
