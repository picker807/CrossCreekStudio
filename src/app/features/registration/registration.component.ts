import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../events/event.service';
import { Event } from '../events/event.model';
import { RegistrationService } from './registration.service';
import { User } from '../user.model';

@Component({
  selector: 'cc-registration',
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
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
    private registrationService: RegistrationService) {}

    ngOnInit(): void {
      this.route.params.subscribe(params => {
        const id = params['id'];
        
        if (id) {
          this.eventService.getEventById(id).subscribe(event => {
            this.event = event;
          });
        }
    
        this.registrationForm = this.fb.group({
          firstName: ['', Validators.required],
          lastName: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]]
        });
      });
    }


  onSubmit(): void {
    //('Registration data:', this.registrationForm.value);
    if (this.registrationForm.valid) {
      const value = this.registrationForm.value;
      this.newUser = {
        id: '',
        ...value
      }
      
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
