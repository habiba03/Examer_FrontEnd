import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, Validators} from "@angular/forms";
import {PaginatorModule} from "primeng/paginator";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {InputOtpModule} from "primeng/inputotp";
import {AuthService} from "../../../../services/auth.service";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [
    FormsModule,
    PaginatorModule,
    RouterLink,
    InputOtpModule,
    ToastModule
  ],
  providers:[MessageService],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.scss'
})
export class OtpVerificationComponent implements OnInit{

  isLoading:boolean = false;
  isReLoading:boolean = false;
  value: string='';
  userEmail:string|null = '';
  userData:any;
  isValid:boolean = true;
  secondsCount:number = 60;

  constructor(private _AuthService:AuthService,private _Router:Router,private _ActivatedRoute:ActivatedRoute, private messageService:MessageService) {
  }

  ngOnInit(): void {
    this.userEmail = this._ActivatedRoute.snapshot.paramMap.get("email");
    this.startCountdown();
  }

  startCountdown() {
    this.isValid = true;
    this.secondsCount = 60;
    const timer = setInterval(() => {
      if (this.secondsCount > 1) {
        this.secondsCount--;
      } else {
        clearInterval(timer);
        this.isValid = false;
      }
    }, 1000);
  }

  handleCheckOtp() {
    this.isLoading = true;
    this.userData= {
      adminEmail: this.userEmail,
      otpCode: this.value
    }
    this._AuthService.resetPasswordCheckOtp(this.userData).subscribe({
      next:(res)=>{
        this.isLoading = false;
        this._Router.navigate([`/pages/newPassword/${this.userEmail}`]);
      },
      error:(err)=>{
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Ooops', detail: err.error.message , key: 'bc'});

      }
    })
  }

  handleResendOtpCode() {
    this.isReLoading = true;
    this._AuthService.forgetPassword({email:this.userEmail}).subscribe({
      next:(res)=>{
        this.isReLoading = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message , key: 'bc'});
        this.startCountdown();

      },
      error:(err)=>{
        this.isReLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Ooops', detail: err.error.message , key: 'bc'});

      }
    })
  }
}
