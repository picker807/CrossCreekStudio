import { Component, OnInit } from '@angular/core';
import { MessageService, Message } from '../../services/message.service';

@Component({
  selector: 'cc-message',
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  message: Message | null = null;
  

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.messageService.message$.subscribe(message => {
      this.message = message;
    }); 
  }
}
