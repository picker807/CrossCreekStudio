import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { RegistrationService } from '../../services/registration.service';
import { User } from '../../models/user.model';
import { PhoneFormatPipe } from '../../core/shared/phone-format.pipe';
import { CheckoutService } from '../../services/checkout.service';
import { from, mergeMap } from 'rxjs';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'cc-registration',
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
  providers: [PhoneFormatPipe]
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  numAttendeesControl: FormControl;
  event: Event;
  isPaid: boolean = false;
  isUserInEvent: boolean = false;
  //showPaymentButton: boolean = false;
  newUser: User;
  previewEnrollees: any[] = [];
  validationErrors: string[] = [];
  showPreview: boolean = false;

  @ViewChild('previewSection') previewSection!: ElementRef; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private eventService: EventService,
    private registrationService: RegistrationService,
    private phoneFormatPipe: PhoneFormatPipe,
    private checkoutService: CheckoutService,
    private messageService: MessageService) {}

  ngOnInit(): void {
    // Initialize the form
    this.initializeForm();
    this.addAttendee();

    this.numAttendeesControl.valueChanges.subscribe(value => {
      this.updateAttendees(value);
    });
  
    // Handle route params
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadEvent(id);
      }
    });

    this.applyPhoneFormatPipe();

    
  }
  
  private initializeForm(): void {
    this.numAttendeesControl = new FormControl(1, [Validators.required, Validators.min(1)]);
    this.registrationForm = this.fb.group({
      attendees: this.fb.array([])
    }); 
  }

  get attendeesArray() {
    return this.registrationForm.get('attendees') as FormArray;
  }

  applyPhoneFormatPipe() {
    this.attendeesArray.controls.forEach((attendeeForm: FormGroup) => {
      this.applyPhoneFormatPipeToControl(attendeeForm.get('phone')as FormControl);
    });
  }

  applyPhoneFormatPipeToControl(control: FormControl) {
    control.valueChanges.subscribe(value => {
      const formatted = this.phoneFormatPipe.transform(value);
      control.setValue(formatted, { emitEvent: false });
    });
  }

  createAttendeeForm(): FormGroup {
    return this.fb.group({
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
      confirmEmail: ['', [
        Validators.required, 
        Validators.email,
        Validators.maxLength(100)
      ]],
      phone: ['', Validators.required]
    }, { validators: this.emailMatchValidator });
  }

  addAttendee() {
    const attendeeForm = this.createAttendeeForm();
    this.attendeesArray.push(attendeeForm);
    this.applyPhoneFormatPipeToControl(attendeeForm.get('phone') as FormControl);
  }

  removeAttendee(index: number) {
    this.attendeesArray.removeAt(index);
  }

  updateAttendees(numAttendees: number) {
    const currentAttendees = this.attendeesArray.length;
    if (numAttendees > currentAttendees) {
      for (let i = currentAttendees; i < numAttendees; i++) {
        this.addAttendee();
      }
    } else if (numAttendees < currentAttendees) {
      for (let i = currentAttendees - 1; i >= numAttendees; i--) {
        this.removeAttendee(i);
      }
    }
  }

  incrementAttendees() {
    if (!this.showPreview) {
    this.numAttendeesControl.setValue(this.numAttendeesControl.value + 1);
    }
  }

  decrementAttendees() {
    if (this.numAttendeesControl.value > 1 && !this.showPreview) {
      this.numAttendeesControl.setValue(this.numAttendeesControl.value - 1);
    }
  }
  
  private loadEvent(id: string): void {
    this.eventService.getEventById(id).subscribe(event => {
      this.event = event;
    }, error => {
      this.messageService.showMessage({
        text: 'Error loading event.',
        type: 'error',
        duration: 5000
      });
    });
  }

  emailMatchValidator(form: FormGroup) {
    const email = form.get('email');
    const confirmEmail = form.get('confirmEmail');
    if (email && confirmEmail && email.value !== confirmEmail.value) {
      confirmEmail.setErrors({ emailMismatch: true });
    } else {
      confirmEmail.setErrors(null);
    }
  }

  getTotalPrice(): number {
    return this.event ? this.event.price * this.numAttendeesControl.value : 0;
  }

  previewCart() {
    this.previewEnrollees = this.attendeesArray.value.map((attendee: any) => {
      const { confirmEmail, ...rest } = attendee; // Destructure to exclude confirmEmail
      return {
        ...rest,
        compositeKey: `${rest.firstName.toLowerCase()}_${rest.lastName.toLowerCase()}_${rest.email.toLowerCase()}`
      };
    });
    this.validateEnrollees();
    setTimeout(() => {
      this.previewSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }
  

  validateEnrollees() {
    this.validationErrors = [];
    const validatedEnrollees: any[] = [];

    from(this.previewEnrollees).pipe(
      mergeMap(enrollee => 
        this.registrationService.checkUserInEvent(enrollee, this.event).pipe(
          mergeMap(isInEvent => {
            if (isInEvent) {
              this.validationErrors.push(`${enrollee.firstName} ${enrollee.lastName} is already registered for this event.`);
              return [];
            } else {
              validatedEnrollees.push(enrollee);
              return [enrollee];
            }
          })
        )
      )
    ).subscribe({
      next: () => {
        this.previewEnrollees = validatedEnrollees;
        if (this.validationErrors.length > 0) {
          this.messageService.showMessage({
            text: 'Some enrollees are already registered for this event.',
            type: 'warning',
            duration: 5000
          });
        }
      },
      error: (err) => {
        console.error('Error validating enrollees:', err);
        this.messageService.showMessage({
          text: 'An error occurred while validating enrollees.',
          type: 'error',
          duration: 5000
        });
      }
    });
  }

  onSubmit(): void {

    if (this.registrationForm.valid) {
      this.showPreview = true;
      this.registrationForm.disable();
      this.numAttendeesControl.disable();
      this.previewCart();
    }
  } 

  cancelPreview() {
    this.showPreview = false;
    this.previewEnrollees = [];
    this.registrationForm.enable();
    this.numAttendeesControl.enable();
  }

  addToCart() {
    if (this.previewEnrollees.length > 0) {
      const eventForCart = {
        eventId: this.event.id,
        enrollees: this.previewEnrollees.map(attendee => ({
          firstName: attendee.firstName,
          lastName: attendee.lastName,
          email: attendee.email,
          phone: attendee.phone
        }))
      };
  
      //console.log('Sending to cart:', eventForCart); // Debug log
  
      this.checkoutService.addEventToCart(eventForCart).subscribe({
        next: (response) => {
          //console.log('Event added:', response);
          this.previewEnrollees = [];
          this.registrationForm.reset();
          this.numAttendeesControl.setValue(1);
          this.updateAttendees(1);
          this.showPreview = false;
          this.registrationForm.enable();
          this.numAttendeesControl.enable();
          this.messageService.showMessage({
            text: 'Added to cart successfully.',
            type: 'success',
            duration: 3000
          });
          this.router.navigate(['/cart']);
        },
        error: (err) => {
          console.error('Cart error:', err);
          this.messageService.showMessage({
            text: 'Failed to add to cart: ' + err.message,
            type: 'error',
            duration: 5000
          });
        }
      });
    } else {
      this.messageService.showMessage({
        text: 'No enrollees to add to cart.',
        type: 'error',
        duration: 5000
      });
    }
  }
}