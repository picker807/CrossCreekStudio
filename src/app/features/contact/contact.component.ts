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
      const formData = this.contactForm.value;
      
      // Prepare the data for the email template
      const templateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        contactMethod: formData.contactMethod
      };

      // Use the EmailService to send the email
      this.emailService.sendEmail(
        [],
        `New CCS Contact Form Message from ${formData.name} --- ${formData.subject}`,
        'contact', // Email template name
        templateData,
        false // contact form doesn't require authentication
      ).subscribe({
        next: (response) => {
          this.messageService.showMessage({
            text: 'Your message has been sent successfully',
            type: 'success',
            duration: 5000
          });
          this.contactForm.reset();
        },
        error: (error) => {
          this.messageService.showMessage({
            text: 'There was an error sending your message. Please try again.',
            type: 'error',
            duration: 5000
          });
          console.error('Error sending contact message:', error);
        }
      });
    } else {
      this.messageService.showMessage({
        text: 'Please fill out all required fields correctly.',
        type: 'error',
        duration: 5000
      });
    }
  }

}
