import { Component, OnInit } from '@angular/core';
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
  resetForms: { [key: string]: FormGroup } = {};
  showResetForm: { [key: string]: boolean } = {};
  currentAdmin: Admin;

  constructor(
    private userService: RegistrationService,
    private adminService: AdminService,
    private eventService: EventService,
    private emailService: EmailService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router
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
    this.loadAdmins();
  }

  loadCurrentAdmin(): void {
    console.log("loading current admin");
    this.adminService.getCurrentAdmin().subscribe({
      next: admin => {
        console.log("Admin returned to dashboard: ", admin);
        this.currentAdmin = admin;
        
      },
      error: err => {
        console.error(err)
        this.messageService.showMessage({
          text: 'Failed to load current admin',
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
    this.adminService.getAllAdmins().subscribe({
      next: admins => {
        this.admins = admins;
        this.admins.forEach(admin => {
          this.resetForms[admin._id] = this.fb.group({
            newPassword: ['', Validators.required]
          });
          this.showResetForm[admin._id] = false;
        });
      },
      error: err => {
        this.messageService.showMessage({
          text: 'Failed to load admins',
          type: 'error',
          duration: 5000
        });
      }
    });
  }

  toggleResetForm(adminId: string): void {
    if (this.currentAdmin._id !== adminId) {
      this.showResetForm[adminId] = !this.showResetForm[adminId];
    }
  }

  onEventSelect(eventId: string): void {
    this.eventService.getEventUsers(eventId).subscribe({
      next: users => {
        this.selectedEventUsers = users;
        this.selectedUsers = [];
      },
      error: err => {
        this.messageService.showMessage({
          text: 'Failed to load event attendees',
          type: 'error',
          duration: 5000
      });
    }
    });
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
          this.messageService.showMessage({
            text: 'Failed to change password',
            type: 'error',
            duration: 5000
        });
        }
      });
    }
  }

  resetPassword(adminId: string): void {
    if (this.resetForms[adminId].valid) {
      const newPassword = this.resetForms[adminId].value.newPassword;
      this.adminService.resetPassword(adminId, newPassword).subscribe({
        next: response => {
          this.messageService.showMessage({
            text: 'Password reset successfully',
            type: 'success',
            duration: 5000
          });
          this.showResetForm[adminId] = false;
        },
        error: err => {
          this.messageService.showMessage({
            text: 'Failed to reset password',
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
        _id: "",
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

  editAdmin(adminId: string, updatedData: Partial<Admin>): void {
    this.adminService.editAdmin(adminId, updatedData).subscribe(updatedAdmin => {
      const index = this.admins.findIndex(admin => admin._id === adminId);
      if (index !== -1) {
        this.admins[index] = updatedAdmin;
        // Provide user feedback
      }
    });
  }

  sendMessage(): void {
    if (this.messageForm.valid && this.selectedUsers.length > 0) {
      const { subject, message } = this.messageForm.value;
      const selectedUserEmails = this.selectedEventUsers
        .filter(user => this.selectedUsers.includes(user.id))
        .map(user => user.email);

      this.emailService.sendEmail(selectedUserEmails, subject, message).subscribe({
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

  logout(): void {
    this.adminService.logout();
    this.router.navigate(['/admin/login']);
    this.messageService.showMessage({
      text: 'Logged out successfully',
      type: 'success',
      duration: 3000
  });
  }
}