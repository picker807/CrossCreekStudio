import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/authentication/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event.service';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
//import { MatDatepickerModule } from '@angular/material/datepicker';
import { User } from '../../user.model';
import { Event } from '../event.model';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Gallery } from '../../gallery/gallery.model';
import { GalleryService } from '../../gallery/gallery.service';

@Component({
  selector: 'cc-event-edit',
  templateUrl: './event-edit.component.html',
  styleUrl: './event-edit.component.css'
})
export class EventEditComponent {
  isAdmin: boolean = false;
  editForm: FormGroup;
  galleryForm: FormGroup;
  galleries: Gallery[] = [];
  newAttendeeForm: FormGroup;
  editMode: boolean = false;
  originalEvent: Event;
  eventSubscription: Subscription;
  gallerySubscription: Subscription;
  //newEvent: Event;

  constructor(private fb: FormBuilder,
    private eventService: EventService,
    private galleryService: GalleryService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute){}

  ngOnInit(): void {
    this.authService.isAdmin$.subscribe(isAdmin => {
      this.isAdmin = isAdmin;
    });

    this.galleryForm = this.fb.group({
      galleries: this.fb.array([])
    });

    this.gallerySubscription = this.galleryService.galleryList$.subscribe((galleryList: Gallery[]) => {
      this.galleries = galleryList;
    })

    this.eventSubscription = this.eventService.eventsChanged.subscribe(() => {
      this.router.navigate(['/events']);
    });

    this.editForm = this.fb.group({
      name: [''],
      date: [''],
      location: [''],
      description: [''],
      isVirtual: [false],
      attendees: this.fb.array([]),
      isRegistrationOpen: [false],
      imageUrl: ['']
    });

    this.newAttendeeForm = this.fb.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id === undefined || id === null) {
        this.editMode = false;
        return;
      }
      

      this.originalEvent = this.eventService.getEventById(id);
      if (this.originalEvent === undefined || this.originalEvent === null) {
        return;
      }

      this.editMode = true;
      this.updateForm();
      //this.event = JSON.parse(JSON.stringify(this.originalEvent));
    });
  }

  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
    this.gallerySubscription.unsubscribe();
  }

  updateForm(): void {
    this.editForm.patchValue({
      name: this.originalEvent.name,
      date: this.originalEvent.date,
      location: this.originalEvent.location,
      description: this.originalEvent.description,
      //attendees: this.originalEvent.attendees,
      isVirtual: this.originalEvent.isVirtual,
      isRegistrationOpen: this.originalEvent.isRegistrationOpen,
      images: this.originalEvent.images
    });
    this.setAttendees();
  }
    
    
  setAttendees(): void {
    console.log("Start setAttendees- originalEvent: ", this.originalEvent.attendees);
    const attendeesFormArray = this.attendees;
    attendeesFormArray.clear();
    this.originalEvent.attendees.forEach(attendee => {
      const attendeeGroup = this.fb.group({
        id: [attendee.id || ''],
        firstName: [attendee.firstName || '', Validators.required],
        lastName: [attendee.lastName || '', Validators.required],
        email: [attendee.email || '', [Validators.required, Validators.email]]
      });
      attendeesFormArray.push(attendeeGroup);
    });
    console.log("End setAttendees - attendeesFormArray: ", attendeesFormArray);
  }
    

  submitEdit(): void {

    if (this.editForm.valid) {
      console.log('Form Data:', this.editForm.value);
      const value = this.editForm.value;
      const newEvent: Event = {
        id: '',
        name: value.name,
        date: value.date,
        isVirtual: value.isVirtual,
        location: value.location,
        description: value.description,
        attendees: value.attendees,
        isRegistrationOpen: value.isRegistrationOpen,
        images: value.images
      };

      

    if (this.editMode) {
      this.eventService.updateEvent(this.originalEvent, newEvent);
    } else {
      this.eventService.createEvent(newEvent);
    }
    }
    

      /*
      const eventId = this.route.snapshot.paramMap.get('id');
      // Call the service to update the event
      this.eventService.updateEvent(eventId, this.editForm.value);
        
      this.router.navigate(['/events', eventId]);*/
    };
    

    get attendees(): FormArray {
      return this.editForm.get('attendees') as FormArray;
    }

  cancelEdit(): void {
    this.router.navigate(['/events', this.originalEvent.id]);
  }
    
  addAttendee() {
    if (this.newAttendeeForm.valid) {
      const newAttendee = this.fb.group({
        id: [this.newAttendeeForm.value.id || ''],
        firstName: [this.newAttendeeForm.value.firstName],
        lastName: [this.newAttendeeForm.value.lastName],
        email: [this.newAttendeeForm.value.email]
      });
  
      this.attendees.push(newAttendee);
      this.newAttendeeForm.reset();
    }
  
  
  
    //(this.editForm.get('attendees') as FormArray).push(attendeeGroup);


    //const attendeesFormArray = this.editForm.get('attendees') as FormArray;
    //attendeesFormArray.push(this.fb.control(''));
  }

  removeAttendee(index: string) {
    this.attendees.removeAt(+index);
  } 
    
}

