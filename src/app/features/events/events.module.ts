// events.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsRoutingModule } from './events-routing.module';
import { EventListComponent } from './event-list/event-list.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { EventItemComponent } from './event-item/event-item.component';
import { SharedModule } from "../../shared/shared.module";

@NgModule({
    declarations: [
        EventListComponent,
        EventDetailComponent,
        EventItemComponent
    ],
    imports: [
        CommonModule,
        EventsRoutingModule,
        SharedModule
    ]
})
export class EventsModule { }
