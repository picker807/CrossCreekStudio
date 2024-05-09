// events.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsRoutingModule } from './events-routing.module';
import { EventListComponent } from './event-list/event-list.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { EventItemComponent } from './event-item/event-item.component';
import { SharedModule } from "../../shared/shared.module";
import { EventEditComponent } from './event-edit/event-edit.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
    declarations: [
        EventListComponent,
        EventDetailComponent,
        EventItemComponent,
        EventEditComponent
    ],
    imports: [
        CommonModule,
        EventsRoutingModule,
        SharedModule,
        MatDatepickerModule,
        MatNativeDateModule,
        SharedModule,        
    ]
})
export class EventsModule { }
