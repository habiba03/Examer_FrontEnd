import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {PaginatorModule} from "primeng/paginator";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {NgIf} from "@angular/common";
import {AuthService} from "../../../../services/auth.service";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-new-passeord',
  standalone: true,
  imports: [
    FormsModule,
    PaginatorModule,
    RouterLink,
    NgIf,
    ReactiveFormsModule,
    ToastModule
  ],
  providers:[MessageService],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss'
})
export class NewPasswordComponent implements OnInit{
  showPassword: boolean = false;
  showRePassword: boolean = false;
  isLoading: boolean = false;
  userEmail: string | null ='';
  userData:any ;

  newPasswordForm:FormGroup = new FormGroup({
    password: new FormControl(null, [Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,}$/)]),
    rePassword: new FormControl(null, Validators.required),
  },{validators:this.rePasswordMatch})



  constructor(private _AuthService:AuthService, private _Router:Router,private _ActivatedRoute:ActivatedRoute, private messageService:MessageService) {
  }

  ngOnInit(): void {
    this.userEmail = this._ActivatedRoute.snapshot.paramMap.get("email");
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


  handleNewPassword(newPasswordForm: FormGroup) {
    this.isLoading  =true;
    this.userData = {
      "newPassword":newPasswordForm.value.password,
      "adminEmail":this.userEmail
    }
    this._AuthService.resetPasswordUpdate(this.userData).subscribe({
      next:(res)=>{
        this.isLoading  =false;
        this._Router.navigate([`/pages/login`]);
      },
      error:(err)=>{
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Ooops', detail: err.error.message , key: 'bc'});
      }
    })
  }


}
