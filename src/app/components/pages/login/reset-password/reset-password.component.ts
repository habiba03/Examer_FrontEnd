import { Component } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {PaginatorModule} from "primeng/paginator";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../../../services/auth.service";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule,
    PaginatorModule,
    RouterLink,
    ReactiveFormsModule,
    ToastModule
  ],
  providers:[MessageService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {


  isLoading:boolean = false;

  forgetPasswordForm:FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.email, Validators.required])
  })

  constructor(private _AuthService:AuthService, private _Router:Router, private messageService:MessageService) {
  }

  handleForgetPassword(forgetPasswordForm: FormGroup) {
    this.isLoading = true;
      this._AuthService.forgetPassword(forgetPasswordForm.value).subscribe({
        next:(res)=>{
          this.isLoading = false;

          this._Router.navigate([`/pages/otpVerification/${forgetPasswordForm.value.email}`])
        },
        error:(err)=>{
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Ooops', detail: err.error.message , key: 'bc'});

        }
      })
  }
}
