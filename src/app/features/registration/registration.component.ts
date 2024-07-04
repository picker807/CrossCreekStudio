import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../events/event.service';
import { Event } from '../events/event.model';
import { RegistrationService } from './registration.service';
import { User } from '../user.model';
import { PhoneFormatPipe } from '../../core/shared/phone-format.pipe';

@Component({
  selector: 'cc-registration',
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
  providers: [PhoneFormatPipe]
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  event: Event;
  isPaid: boolean = false;
  isUserInEvent: boolean = false;
  showPaymentButton: boolean = false;
  newUser: User;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private eventService: EventService,
    private registrationService: RegistrationService,
    private phoneFormatPipe: PhoneFormatPipe) {}

    ngOnInit(): void {
      // Initialize the form
      this.initializeForm();
    
      // Handle route params
      this.route.params.subscribe(params => {
        const id = params['id'];
        if (id) {
          this.loadEvent(id);
        }
      });

      this.registrationForm.get('phone').valueChanges.subscribe(value => {
        const formatted = this.phoneFormatPipe.transform(value);
        this.registrationForm.get('phone').setValue(formatted, { emitEvent: false });
      });
    }
    
    private initializeForm(): void {
      this.registrationForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/)]]
      }, { validators: this.emailMatchValidator });
    }
    
    private loadEvent(id: string): void {
      this.eventService.getEventById(id).subscribe(event => {
        this.event = event;
        // You can update the form with event data here if needed
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

  onSubmit(): void {
    //('Registration data:', this.registrationForm.value);
    if (this.registrationForm.valid) {
      const value = { ...this.registrationForm.value };
      delete value.confirmEmail;
      const rawPhoneNumber = value.phone.replace(/\D/g, '');

      this.newUser = {
        id: '',
        ...value,
        phone: rawPhoneNumber
      }
      console.log("New User: ", this.newUser)
      
      //this.registrationService.addUser(newUser, this.event);
      this.checkUserInEvent(this.newUser.email);
    }
  }

  checkUserInEvent(email: string): void {
    this.eventService.getEventUsers(this.event.id).subscribe(eventUsers => {
      
        //console.log(eventUsers);
      
      this.isUserInEvent = eventUsers.some(user => user.email === email);
        //console.log("Is In Event?? ", this.isUserInEvent)
      
      this.showPaymentButton = true;
    });
  }
  

  makePayment(): void {
    this.isPaid = true; //This will be set using a Paypal service
    if (this.isPaid) {
    this.registrationService.addUser(this.newUser, this.event).subscribe(() => {
      this.router.navigate(['/events']);
    });
    }
  }
}
