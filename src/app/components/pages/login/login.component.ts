import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {NgIf} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {secureLocalStorage} from "../../../secureLocalStorage/secure-storage-util";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    ReactiveFormsModule,
    ToastModule
  ],
  providers:[MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  showPassword: boolean = false;

  loginForm:FormGroup = new FormGroup({
    adminUserName: new FormControl(null, Validators.required),
    password: new FormControl(null, Validators.required),
  })
  isLoading: boolean = false;

  constructor(private _AuthService:AuthService, private _Router:Router,private messageService: MessageService) {
    // async function generateSecretKey() {
    //   const key = window.crypto.getRandomValues(new Uint8Array(16)); // 16 bytes = 128-bit key
    //   return Array.from(key).map((b) => b.toString(16).padStart(2, '0')).join('');
    // }
    //
    // generateSecretKey().then((key) => console.log("Secret Key:", key));
  }


  handleLogin(loginForm:FormGroup){
    this.isLoading = true;
    this._AuthService.login(loginForm.value).subscribe({
      next:(data)=>{
        this.isLoading = false;
        secureLocalStorage.setItem("token",data.token);
        this._AuthService.decodeToken();

        if(this._AuthService.decodedTokenInfo.value.role == "admin"){
          this._Router.navigate(['/dashboard/admin']);
        }else if (this._AuthService.decodedTokenInfo.value.role == "super_admin"){
          this._Router.navigate(['/dashboard/superAdmin']);
        }
      },
      error:(err)=>{
        this.isLoading = false;

        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message , key: 'bc'});
      }
    })
  }


}
