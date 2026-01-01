import { Component } from '@angular/core';
import {NgIf} from "@angular/common";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {ProfileService} from "../../../../../services/profile.service";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import Swal from "sweetalert2";

@Component({
  selector: 'app-change-pass',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    ToastModule
  ],
  providers:[MessageService],
  templateUrl: './change-pass.component.html',
  styleUrl: './change-pass.component.scss'
})
export class ChangePassComponent {
  showPassword: boolean = false;
  showRePassword: boolean = false;
  showConfPassword: boolean = false;
  isLoading:boolean = false;
  adminId!:number;

  changePasswordForm:FormGroup = new FormGroup({
    currentPassword: new FormControl(null, Validators.required),
    password: new FormControl(null, [Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,}$/)]),
    rePassword: new FormControl(null, Validators.required),
  },{validators:this.rePasswordMatch})

  constructor(private _AuthService:AuthService, private _ProfileService:ProfileService,private messageService:MessageService) {
  }

  rePasswordMatch(registerForm:any) {
    let passwordInput = registerForm.get('password');
    let repasswordInput = registerForm.get('rePassword');

    if (passwordInput?.value === repasswordInput?.value) {
      return null;
    } else {
      repasswordInput?.setErrors({ repasswordMatch: 'password and confirm password doesnt matched' });
      return {repasswordMatch:'password and confirm password doesnt matched'}
    }
  }

  handleChangePassword(changePasswordForm: FormGroup) {
    this._AuthService.decodeToken()
    this.adminId = this._AuthService.decodedTokenInfo.value.id;
    let changeReq ={
      "oldPassword":changePasswordForm.get("currentPassword")?.value,
      "newPassword":changePasswordForm.get("password")?.value,
    }
    this._ProfileService.changePassword(changeReq, this.adminId).subscribe({
      next:(res)=>{
        // this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message , key: 'bc'});
        Swal.fire({
          title:"Success",
          text:res.message + ", please login again!",
          icon:"success"
        })
        this._AuthService.logout();

      },
      error:(err)=>{
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message , key: 'bc'});

      }
    })
  }
}
