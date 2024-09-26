import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Event } from '../../../models/event.model';
import { Subscription } from 'rxjs';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Gallery } from '../../../models/gallery.model';
import { GalleryService } from '../../../services/gallery.service';
import { PhoneFormatPipe } from '../../../core/shared/phone-format.pipe';
import { ConfirmationDialogComponent } from '../../../core/shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'cc-event-edit',
  templateUrl: './event-edit.component.html',
  styleUrl: './event-edit.component.css',
  providers: [PhoneFormatPipe]
})
export class EventEditComponent implements OnInit, OnDestroy {
  editForm: FormGroup;
  galleryForm: FormGroup;
  galleries: Gallery[] = [];
  newAttendeeForm: FormGroup;
  editMode: boolean = false;
  originalEvent: Event;
  eventSubscription: Subscription;
  gallerySubscription: Subscription;
  showModifyEvent: boolean = true;

  constructor(private fb: FormBuilder,
    private eventService: EventService,
    private galleryService: GalleryService,
    private router: Router,
    private route: ActivatedRoute,
    private phoneFormatPipe: PhoneFormatPipe,
    private dialog: MatDialog,
    private messageService: MessageService){
      
    }

  ngOnInit(): void {
    this.galleryForm = this.fb.group({
      galleries: this.fb.array([])
    });

    this.gallerySubscription = this.galleryService.galleryList$.subscribe(galleries => {
      //console.log('Galleries received:', galleries);
      this.galleries = galleries;
    });

    this.galleryService.loadAllData().subscribe();

    this.editForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.maxLength(100)],
      description: ['', Validators.maxLength(2000)],
      price: [null,[Validators.min(0), Validators.max(999)]],
      attendees: this.fb.array([]),
      images: this.fb.array([]),
      isPrivate: [false]
    });

    this.newAttendeeForm = this.fb.group({
      id: [''],
      firstName: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.maxLength(100)
      ]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/)]]
    });

    this.newAttendeeForm.get('phone').valueChanges.subscribe(value => {
      const formatted = this.phoneFormatPipe.transform(value);
      this.newAttendeeForm.get('phone').setValue(formatted, { emitEvent: false });
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
    });

    //this.updateShowModifyEvent();
  }

  onGalleriesLoaded(galleries: Gallery[]): void {
    this.galleries = galleries;
  }

  ngOnDestroy(): void {
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    if (this.gallerySubscription) {
    this.gallerySubscription.unsubscribe();
    }
  }

  updateForm(): void {
    const eventDate = new Date(this.originalEvent.date);
    this.editForm.patchValue({
      name: this.originalEvent.name,
      date: eventDate,
      time: eventDate.toTimeString().slice(0, 5),
      location: this.originalEvent.location,
      description: this.originalEvent.description,
      price: this.originalEvent.price,
      isPrivate: this.originalEvent.isPrivate
    });
    this.setAttendees();
    this.setImages();
    this.checkFormValidity();
  }
    
    
  setAttendees(): void {
    //console.log("Start setAttendees- originalEvent: ", this.originalEvent.attendees);
    const attendeesFormArray = this.attendees;
    attendeesFormArray.clear();
    this.originalEvent.attendees.forEach(attendee => {
      const formattedPhone = this.phoneFormatPipe.transform(attendee.phone);
      const attendeeGroup = this.fb.group({
        id: [attendee.id || ''],
        firstName: [attendee.firstName || '', Validators.required],
        lastName: [attendee.lastName || '', Validators.required],
        email: [attendee.email || '', [Validators.required, Validators.email]],
        phone: [formattedPhone || '', [Validators.required, Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/)]]
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
    this.checkFormValidity();
    
      console.log('Form Data:', this.editForm.value);
      const value = this.editForm.value;

      const combinedDateTime = new Date(value.date);
    
    // Parse the time string from "11:30 PM" format
    const [time, period] = value.time.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    // Adjust hours for PM
    if (period.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    }
    // Adjust for midnight (12 AM)
    if (period.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    combinedDateTime.setHours(hours);
    combinedDateTime.setMinutes(minutes);

      const processedAttendees = value.attendees.map(attendee => ({
        ...attendee,
        phone: attendee.phone.replace(/\D/g, ''), // Remove non-digit characters
        compositeKey: `${attendee.firstName.toLowerCase()}_${attendee.lastName.toLowerCase()}_${attendee.email.toLowerCase()}` 
      }));

      const newEvent: Event = {
        ...value,
        date: combinedDateTime,
        attendees: processedAttendees
      };

      if (this.editMode) {
        newEvent.id = this.originalEvent.id;
        this.eventService.updateEvent(newEvent).subscribe({
          next: (updatedEvent) => {
            console.log("Event updated successfully: ", updatedEvent);
            this.messageService.showMessage({
              text: 'Event updated successfully',
              type: 'success',
              duration: 3000
            });
            this.router.navigate(['/events', updatedEvent.id]);
          },
          error: (err) => {
            console.error('Error updating event:', err);
            this.messageService.showMessage({
              text: 'Error updating event. Please try again.',
              type: 'error',
              duration: 5000
            });
          }
        });
      } else {
        this.eventService.createEvent(newEvent).subscribe({
          next: (createdEvent) => {
            this.messageService.showMessage({
              text: 'Event created successfully',
              type: 'success',
              duration: 3000
            });
            setTimeout(() => this.router.navigate(['/events']), 100);
          },
          error: (err) => {
            console.error('Error creating event:', err);
            this.messageService.showMessage({
              text: 'Error creating event. Please try again.',
              type: 'error',
              duration: 5000
            });
          }
        });
      }
    //}
  }

  get attendees(): FormArray {
    return this.editForm.get('attendees') as FormArray;
  }

  get images(): FormArray {
    return this.editForm.get('images') as FormArray;
  }

  cancelEdit(): void {
    if (this.originalEvent?.id) {
      this.router.navigate(['/events', this.originalEvent.id]);
    } else {
      this.router.navigate(['/events']);
    }
  }
    
  addAttendee() {
    if (this.newAttendeeForm.valid) {
      const newAttendee = this.fb.group({
        id: [this.newAttendeeForm.value.id || ''],
        firstName: [this.newAttendeeForm.value.firstName],
        lastName: [this.newAttendeeForm.value.lastName],
        email: [this.newAttendeeForm.value.email],
        phone: [this.newAttendeeForm.value.phone]
      });
  
      this.attendees.push(newAttendee);
      this.newAttendeeForm.reset();
      this.messageService.showMessage({
        text: 'Attendee added successfully',
        type: 'success',
        duration: 3000
      });
    } else {
      this.messageService.showMessage({
        text: 'Please fill in all attendee fields correctly.',
        type: 'warning',
        duration: 5000
      });
    }
  }
 
  removeAttendee(index: string) {
    this.attendees.removeAt(+index);
    this.messageService.showMessage({
      text: 'Attendee removed',
      type: 'info',
      duration: 3000
    });
  }

  removeImage(index: string) {
    this.images.removeAt(+index);
    this.messageService.showMessage({
      text: 'Image removed',
      type: 'info',
      duration: 3000
    });
  }
    
  drop(event: CdkDragDrop<Gallery[]>): void {
    if (event.previousContainer !== event.container) {
      const gallery = event.previousContainer.data[event.previousIndex];
      const imagesFormArray = this.editForm.get('images') as FormArray;
      imagesFormArray.push(this.fb.group({
        id: [gallery.id, Validators.required],
        imageUrl: [gallery.imageUrl, Validators.required]
      }));
      this.messageService.showMessage({
        text: 'Image added to event',
        type: 'success',
        duration: 3000
      });
    }
  }

  checkFormValidity() {
    console.log('Form valid:', this.editForm.valid);
    console.log('Form errors:', this.editForm.errors);
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      console.log(`${key} valid:`, control.valid, 'errors:', control.errors);
    });
  }

  deleteEvent(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this event?'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventService.deleteEvent(this.originalEvent.id).subscribe({
          next: () => {
            this.messageService.showMessage({
              text: 'Event deleted successfully',
              type: 'success',
              duration: 3000
            });
            this.router.navigate(['/events']);
          },
          error: (err) => {
            console.error('Error deleting event:', err);
            this.messageService.showMessage({
              text: 'Error deleting event. Please try again.',
              type: 'error',
              duration: 5000
            });
          }
        });
      }
    });
  }


  updateShowModifyEvent(): void {
    const dateValue = this.editForm.get('date').value;
    const timeValue = this.editForm.get('time').value;
  
    if (dateValue && timeValue) {
      // Check if dateValue is a Date object (which it likely is when using matDatepicker)
      let eventDateTime: Date;
      if (dateValue instanceof Date) {
        eventDateTime = new Date(dateValue);
        eventDateTime.setHours(0, 0, 0, 0); // Reset time to start of day
      } else {
        // If it's a string, parse it (though this case is unlikely with matDatepicker)
        const [year, month, day] = dateValue.split('-').map(Number);
        eventDateTime = new Date(year, month - 1, day);
      }
  
      // Parse and set the time
      const [hours, minutes] = timeValue.split(':').map(Number);
      eventDateTime.setHours(hours, minutes);
  
      // Get the current date and time
      const now = new Date();
  
      // Compare the two dates
      this.showModifyEvent = eventDateTime > now;
  
      console.log('Event DateTime:', eventDateTime);
      console.log('Current DateTime:', now);
      console.log('Show Modify Event:', this.showModifyEvent);
    } else {
      this.showModifyEvent = false;
    }
  }
}

