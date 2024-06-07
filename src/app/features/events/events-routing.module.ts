// events-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventListComponent } from './event-list/event-list.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { EventEditComponent } from './event-edit/event-edit.component';
import { RegistrationComponent } from '../registration/registration.component';

const routes: Routes = [
  { path: '', component: EventListComponent },
  { path: 'new', component: EventEditComponent },
  { path: ':id/register', component: RegistrationComponent},
  { path: ':id/edit', component: EventEditComponent },
  { path: ':id', component: EventDetailComponent }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule { }
