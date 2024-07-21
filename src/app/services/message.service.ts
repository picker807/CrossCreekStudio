import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Message {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messageSubject = new BehaviorSubject<Message | null>(null);
  public message$: Observable<Message | null> = this.messageSubject.asObservable();

  showMessage(message: Message): void {
    console.log("message triggered");
    this.messageSubject.next(message);
    if (message.duration) {
      setTimeout(() => this.clearMessage(), message.duration);
    }
  }

  clearMessage(): void {
    this.messageSubject.next(null);
  }
}
