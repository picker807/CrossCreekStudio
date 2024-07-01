import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegistrationService } from '../../registration/registration.service';
import { AdminService } from '../admin.service';
import { User } from '../../user.model';
import { Admin } from '../admin.model';
import { Event } from '../../events/event.model';
import { EventService } from '../../events/event.service';
import { PhoneFormatPipe } from '../../../core/shared/phone-format.pipe';
import { Router } from '@angular/router';

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
  selectedUsers: string[] = [];

  constructor(
    private userService: RegistrationService,
    private adminService: AdminService,
    private eventService: EventService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required]
    });

    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadAdmins();
  }

  loadEvents(): void {
    this.eventService.events$.subscribe(events => {
      this.events = events;
    });
  }

  loadAdmins(): void {
    this.adminService.getAllAdmins().subscribe(admins => {this.admins = admins});
  }

  onEventSelect(eventId: string): void {
    this.eventService.getEventUsers(eventId).subscribe(users => {
      this.selectedEventUsers = users;
      this.selectedUsers = [];
    });
  }

  changePassword(): void {
    if (this.changePasswordForm.valid) {
      const { oldPassword, newPassword } = this.changePasswordForm.value;
      this.adminService.changePassword(oldPassword, newPassword).subscribe(response => {
        console.log('Password changed successfully');
      });
    }
  }

  resetPassword(adminId: string, newPassword: string): void {
    this.adminService.resetPassword(adminId, newPassword).subscribe();
  }

  sendMessage(): void {
    if (this.messageForm.valid) {
      const message = this.messageForm.value.message;
      const selectedUserEmails = this.users.filter(user => this.selectedUsers.includes(user.id)).map(user => user.email);
      //this.emailService.sendEmail(selectedUserEmails, 'Message from Admin', message).subscribe();
    }
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
  }
}