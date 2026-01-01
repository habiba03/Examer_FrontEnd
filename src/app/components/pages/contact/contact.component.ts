import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ContactService} from "../../../services/contact.service";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ToastModule
  ],
  providers:[MessageService],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {

  isLoading:boolean = false;

  contactForm: FormGroup = new FormGroup({
    userEmail: new FormControl(null, [Validators.required,Validators.email]),
    subject: new FormControl(null, Validators.required),
    userMessage: new FormControl(null, Validators.required),
  })

  constructor(private _ContactService:ContactService, private messageService:MessageService) {
  }

  handleContact(contactForm: FormGroup) {
    this.isLoading = true
    this._ContactService.contact(contactForm.value).subscribe({
      next:(res)=>{
        this.isLoading = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message , key: 'bc'});

      },
      error:(err)=>{
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message , key: 'bc'});
      }
    })
  }
}
