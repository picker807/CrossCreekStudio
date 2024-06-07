import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/authentication/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event.service';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
//import { MatDatepickerModule } from '@angular/material/datepicker';
import { User } from '../../user.model';
import { Event } from '../event.model';
import { first, startWith } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Gallery } from '../../gallery/gallery.model';
import { GalleryService } from '../../gallery/gallery.service';

@Component({
  selector: 'cc-event-edit',
  templateUrl: './event-edit.component.html',
  styleUrl: './event-edit.component.css'
})
export class EventEditComponent implements OnInit, OnDestroy {
  isAdmin: boolean = false;
  editForm: FormGroup;
  galleryForm: FormGroup;
  galleries: Gallery[] = [];
  newAttendeeForm: FormGroup;
  editMode: boolean = false;
  originalEvent: Event;
  eventSubscription: Subscription;
  gallerySubscription: Subscription;
  currentDate: Date = new Date();
  showModifyEvent: boolean;
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

    this.editForm = this.fb.group({
      name: [''],
      date: [''],
      location: [''],
      description: [''],
      price: [],
      isVirtual: [false],
      attendees: this.fb.array([]),
      images: this.fb.array([])
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
      

      this.eventService.getEventById(id).subscribe(event => {
        this.originalEvent = event;
      });
      if (this.originalEvent === undefined || this.originalEvent === null) {
        return;
      }

      this.editMode = true;
      this.updateForm();
      //this.event = JSON.parse(JSON.stringify(this.originalEvent));
    });

    this.editForm.get('date').valueChanges
      .pipe(startWith(this.editForm.get('date').value))
      .subscribe(val => {
        const eventDate = new Date(val);
        this.showModifyEvent = eventDate.getTime() >= this.currentDate.getTime();
      });
  }

  ngOnDestroy(): void {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    this.gallerySubscription.unsubscribe();
  }

  updateForm(): void {
    this.editForm.patchValue({
      name: this.originalEvent.name,
      date: this.originalEvent.date,
      location: this.originalEvent.location,
      description: this.originalEvent.description,
      price: this.originalEvent.price,
      //attendees: this.originalEvent.attendees,
      isVirtual: this.originalEvent.isVirtual,
      //images: this.originalEvent.images
    });
    this.setAttendees();
    this.setImages();
  }
    
    
  setAttendees(): void {
    //console.log("Start setAttendees- originalEvent: ", this.originalEvent.attendees);
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
    //console.log("End setAttendees - attendeesFormArray: ", attendeesFormArray);
  }

  setImages(): void {
    const imagesFormArray = this.images;
    imagesFormArray.clear();
    this.originalEvent.images.forEach(gallery => {
      const imageGroup = this.fb.group({
        id: [gallery.id],
        imageUrl: [gallery.imageUrl]
      });
      imagesFormArray.push(imageGroup);
    });
  }
    

  async submitEdit(): Promise<void> {

    if (this.editForm.valid) {
      console.log('Form Data:', this.editForm.value);
      const value = this.editForm.value;
      const newEvent: Event = {
        ...value,
        date: new Date(value.date)
      };

      if (this.editMode) {
        newEvent.id = this.originalEvent.id;
        this.eventService.updateEvent(newEvent).subscribe({
          next: () => {
            console.log("event edit is navigating");
            this.router.navigate(['/events']);
          },
          error: (err) => {
            console.error('Error updating event:', err);
          }
        });
      } else {
        this.eventService.createEvent(newEvent).subscribe({
          next: () => {
            this.router.navigate(['/events']);
          },
          error: (err) => {
            console.error('Error creating event:', err);
          }
        });
      }
    }
  }

  get attendees(): FormArray {
    return this.editForm.get('attendees') as FormArray;
  }

  get images(): FormArray {
    return this.editForm.get('images') as FormArray;
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

  removeImage(index: string) {
    this.images.removeAt(+index);
  }
    
  drop(event: CdkDragDrop<Gallery[]>): void {
    if (event.previousContainer !== event.container) {
      const gallery = event.previousContainer.data[event.previousIndex];
      const imagesFormArray = this.editForm.get('images') as FormArray;
      imagesFormArray.push(this.fb.group({
        id: [gallery.id, Validators.required],
        imageUrl: [gallery.imageUrl, Validators.required]
      }));
    }
  }
}

