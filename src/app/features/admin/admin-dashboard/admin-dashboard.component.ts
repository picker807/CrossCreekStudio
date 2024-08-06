import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistrationService } from '../../../services/registration.service';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../models/user.model';
import { Admin, AdminCredentials, CreateAdminDto, PasswordChangeRequest } from '../../../models/admin.model';
import { Event } from '../../../models/event.model';
import { EventService } from '../../../services/event.service';
import { PhoneFormatPipe } from '../../../core/shared/phone-format.pipe';
import { Router } from '@angular/router';
import { EmailService } from '../../../services/email.service';
import { MessageService } from '../../../services/message.service';
import { EMPTY, filter, Subject, switchMap, takeUntil } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../core/shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { format } from 'date-fns';

@Component({
  selector: 'cc-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  users: User[] = [];
  admins: Admin[] = [];
  events: Event[] = [];
  selectedEventUsers: User[] = [];
  changePasswordForm: FormGroup;
  messageForm: FormGroup;
  createAdminForm: FormGroup;
  selectedUsers: string[] = [];
  resetForms: {[key: string]: FormGroup } = {};
  showResetForm: { [key: string]: boolean } = {};
  currentAdmin: Admin;
  previewHtml: SafeHtml = '';
  showPreview: boolean = false;
  selectedEvent: Event;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private userService: RegistrationService,
    private adminService: AdminService,
    private eventService: EventService,
    private emailService: EmailService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required]
    });

    this.messageForm = this.fb.group({
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });

    this.createAdminForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      role: ['admin', Validators.required]
    });
  }

  ngOnInit(): void {
   
    this.loadCurrentAdmin();
    this.loadEvents();
  }

  loadCurrentAdmin(): void {
    this.adminService.getCurrentAdmin().pipe(
      switchMap(admin => {
        console.log("Admin returned to dashboard: ", admin);
        this.currentAdmin = admin;
        if (this.currentAdmin.role === "superadmin") {
          return this.adminService.admins$;
        }
        return EMPTY;
      }),
      filter(admins => Array.isArray(admins)),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: admins => {
        this.admins = admins.filter(admin => admin.id !== this.currentAdmin.id);
        this.loadAdmins();
      },
      error: err => {
        console.error(err);
        this.messageService.showMessage({
          text: 'Failed to load admins',
          type: 'error',
          duration: 5000
        });
      }
    });
  }


  loadEvents(): void {
    this.eventService.events$.subscribe({
      next: events => {
        this.events = events;
      },
      error: err => {
        this.messageService.showMessage({
          text: 'Failed to load events',
          type: 'error',
          duration: 5000
      });
      }
    });
  }

  loadAdmins(): void {
    console.log('Loading admins:', this.admins);
    this.admins.forEach(admin => {
      if (!this.resetForms[admin.id]) {
        this.resetForms[admin.id] = this.fb.group({
          name: [admin.name, Validators.required],
          email: [admin.email, [Validators.required, Validators.email]],
          role: [admin.role, Validators.required],
          newPassword: ['', Validators.minLength(4)]
        });
      } else {
        this.resetForms[admin.id].patchValue({
          name: admin.name,
          email: admin.email,
          role: admin.role,
          newPassword: ''
        });
      }
      this.showResetForm[admin.id] = false;
    });
  }

  toggleResetForm(adminId: string): void {
    this.showResetForm[adminId] = !this.showResetForm[adminId];
  }

  onEventSelect(eventId: string): void {
    const selectedEvent = this.events.find(event => event.id === eventId);
    if (selectedEvent) {
      this.selectedEvent = selectedEvent;
      this.selectedEventUsers = selectedEvent.attendees || [];
      this.selectedUsers = [];
  
      // Calculate days until the event
      const daysUntil = this.calculateDaysUntil(this.selectedEvent.date);
  
      // Pre-load the subject and message fields with the reminder message
      const subject = `Reminder: Upcoming Event - ${this.selectedEvent.name}`;
      const message = `This is a reminder for the upcoming Paint Party event "${this.selectedEvent.name}" happening in ${daysUntil} days. We look forward to seeing you there!\n\nBest regards,\nCross Creek Creates`;
  
      this.messageForm.patchValue({
        subject: subject,
        message: message
      });
    } else {
      this.messageService.showMessage({
        text: 'Event not found',
        type: 'error',
        duration: 5000
      });
    }
  }

  previewEmail(): void {
    if (this.messageForm.valid) {
      const { subject, message } = this.messageForm.value;
      const selectedUserEmails = this.selectedEventUsers
        .filter(user => this.selectedUsers.includes(user.id))
        .map(user => user.email);

      console.log("Selected evemt foe email: ", this.selectedEvent)

      const eventDetails = this.selectedEvent ? {
        name: this.selectedEvent.name,
        date: format(new Date(this.selectedEvent.date), 'EEEE, MMMM do, yyyy'),
        time: this.formatTime(this.selectedEvent.date),
        location: this.selectedEvent.location,
        daysUntil: this.calculateDaysUntil(this.selectedEvent.date)
      } : null;

      console.log('Preview Email Data:', { selectedUserEmails, subject, message, eventDetails });

      this.emailService.getEmailPreview(selectedUserEmails, subject, message, eventDetails).subscribe({
        next: (response) => {
          this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(response.html);
          this.showPreview = true;
        },
        error: (err) => {
          this.messageService.showMessage({
            text: 'Failed to generate email preview',
            type: 'error',
            duration: 5000
          });
        }
      });
    }
  }

  formatDate(date: Date): string {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString();
  }

  formatTime(date: Date): string {
    const eventDate = new Date(date);
    return eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  changePassword(): void {
    if (this.changePasswordForm.valid) {
      const request: PasswordChangeRequest = this.changePasswordForm.value;
      this.adminService.changePassword(request).subscribe({
        next: response => {
          this.messageService.showMessage({
            text: 'Password changed successfully',
            type: 'success',
            duration: 3000
        });
        },
        error: err => {
          console.error('Password change error:', err);
          let errorMessage = 'Failed to change password';
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          }
          this.messageService.showMessage({
            text: errorMessage,
            type: 'error',
            duration: 5000
          });
        }
      });
    }
  }

  updateAdmin(adminId: string): void {
    if (this.resetForms[adminId].valid) {
      const updatedData = this.resetForms[adminId].value;
      if (!updatedData.newPassword) {
        delete updatedData.newPassword;
      }
      console.log("Updated Admin Data: ", updatedData);

      this.adminService.updateAdmin(adminId, updatedData).subscribe({
        next: updatedAdmin => {
          console.log("updated admin returned to admin dashboard: ", updatedAdmin);
          //const index = this.admins.findIndex(admin => admin.id == adminId);
          console.log("admin id: ", adminId);
          /* console.log("Index: ", index);
          if (index !== -1) {
            this.admins[index] = updatedAdmin;
          } */

          /* this.admins.forEach(admin => {
            console.log('Admin:', admin);
          }); */
          
          //this.showResetForm[adminId] = false;
          this.messageService.showMessage({
            text: 'Admin updated successfully',
            type: 'success',
            duration: 5000
          });
          location.reload();
          
        },
        error: err => {
          this.messageService.showMessage({
            text: 'Failed to update admin',
            type: 'error',
            duration: 5000
          });
        }
      });
    }
  }

  createAdmin(): void {
    if (this.createAdminForm.valid) {
      const { name, email, password, role } = this.createAdminForm.value;
      const admin: CreateAdminDto = {
        id: "",
        name: name,
        email: email,
        password: password,
        role: role
      };
      this.adminService.createAdmin(admin).subscribe({
        next: newAdmin => {
          this.admins.push(newAdmin);
          this.messageService.showMessage({
            text: 'Admin created successfully',
            type: 'success',
            duration: 5000
          });
          this.createAdminForm.reset();
        },
        error: err => {
          console.error('Error creating admin:', err);
          this.messageService.showMessage({
            text: 'Failed to create admin',
            type: 'error',
            duration: 5000
          });
        }
      });
    }
  }

  sendMessage(): void {
    if (this.messageForm.valid && this.selectedUsers.length > 0) {
      const { subject, message } = this.messageForm.value;
      const selectedUsers = this.selectedEventUsers
        .filter(user => this.selectedUsers.includes(user.id))
        .map(user => ({ firstName: user.firstName, email: user.email }));
        console.log("selected users sent to email: ", selectedUsers);

      const eventDetails = this.selectedEvent ? {
        name: this.selectedEvent.name,
        date: format(new Date(this.selectedEvent.date), 'EEEE, MMMM do, yyyy'), 
        time: this.formatTime(this.selectedEvent.date),
        location: this.selectedEvent.location,
        daysUntil: this.calculateDaysUntil(this.selectedEvent.date)
      } : null;

      this.emailService.sendEmail(selectedUsers, subject, message, eventDetails).subscribe({
        next: response => {
          this.messageService.showMessage({
            text: 'Emails sent successfully',
            type: 'success',
            duration: 3000
        });
          this.messageForm.reset();
          this.selectedUsers = [];
        },
        error: err => {
          this.messageService.showMessage({
            text: 'Failed to send emails',
            type: 'error',
            duration: 5000
        });
        }
      });
    }
  }

  calculateDaysUntil(eventDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of the day
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0); // Set to beginning of the day
    const diffTime = event.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;
    this.selectedUsers = isChecked ? this.selectedEventUsers.map(user => user.id) : [];
  }

  toggleUserSelection(userId: string): void {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
  }

  deleteAdmin(id: string): void {
    console.log("111111");
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this Admin?'
      }
    });
    console.log("222222");
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteAdmin(id).subscribe(() => {
          this.messageService.showMessage({
            text: 'Admin deleted successfully',
            type: 'success',
            duration: 5000
          });
          //this.router.navigate(['/g']);
        });
      } else {
        this.messageService.showMessage({
            text: 'Problem deleting admin',
            type: 'error',
            duration: 5000
          });
      }
    });
  }

  logout(): void {
    this.adminService.logout();
    this.router.navigate(['/admin/login']);
    this.messageService.showMessage({
      text: 'Logged out successfully',
      type: 'success',
      duration: 3000
    });
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}