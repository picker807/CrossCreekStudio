import { Component } from '@angular/core';
import { EmailService } from '../../services/email.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { PhoneFormatPipe } from '../../core/shared/phone-format.pipe';

@Component({
  selector: 'cc-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  providers: [PhoneFormatPipe]
})
export class ContactComponent {
  contactForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    private emailService: EmailService,
    private messageService: MessageService,
    private phoneFormatPipe: PhoneFormatPipe
  ) {}

  ngOnInit(): void{
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/)]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      contactMethod: ['', Validators.required]
    });

    this.contactForm.get('phone').valueChanges.subscribe(value => {
      const formatted = this.phoneFormatPipe.transform(value);
      this.contactForm.get('phone').setValue(formatted, { emitEvent: false });
    });
  }

  sendContactMessage(): void {
    if (this.contactForm.valid) {
      const { name, email, phone, subject, message, contactMethod } = this.contactForm.value;
      this.emailService.sendContactMessage(name, email, phone, subject, message, contactMethod).subscribe({
        next: response => {
          this.messageService.showMessage({
            text: 'Contact Message sent successfully',
            type: 'success',
            duration: 5000
        });
          this.contactForm.reset();
    
        },
        error: err => {
          this.messageService.showMessage({
            text: 'Error submitting Contact Message',
            type: 'error',
            duration: 5000
        });
        }
      });
    }
  }

}
