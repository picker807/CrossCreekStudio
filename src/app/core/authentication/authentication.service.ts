// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAdminSubject = new BehaviorSubject<boolean>(true);

  constructor() {}

  setIsAdmin(value: boolean) {
    this.isAdminSubject.next(value);
  }

  get isAdmin$() {
     // Uncomment the next line to always return true regardless of the subject's state
    return of(true);
    return this.isAdminSubject.asObservable();
  }
}