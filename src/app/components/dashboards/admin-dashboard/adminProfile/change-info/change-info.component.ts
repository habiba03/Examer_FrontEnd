import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {IadminData} from "../../../../../interfaces/iadmin";
import {AuthService} from "../../../../../services/auth.service";
import {ProfileService} from "../../../../../services/profile.service";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import Swal from "sweetalert2";

@Component({
  selector: 'app-change-info',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ToastModule
  ],
  providers:[MessageService],
  templateUrl: './change-info.component.html',
  styleUrl: './change-info.component.scss'
})
export class ChangeInfoComponent implements OnInit{
  isLoading:boolean = false;

  changeInfoForm:FormGroup = new FormGroup({
    adminUserName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{1,20}$/)]),
    phone: new FormControl(null, [Validators.required, Validators.pattern(/^(010|011|012|015)[0-9]{8}$/)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
  })

  adminId!: number;
  admin!:IadminData;


  constructor(private _AuthService:AuthService, private _ProfileService:ProfileService, private messageService:MessageService) {

  }


  ngOnInit() {

    this._AuthService.decodeToken()
    this.adminId = this._AuthService.decodedTokenInfo.value.id;
    this._ProfileService.getAdminById(this.adminId).subscribe({
      next:(res)=>{
        this.admin = res.data;
        this.changeInfoForm.get("adminUserName")?.setValue(this.admin.adminUserName);
        this.changeInfoForm.get("email")?.setValue(this.admin.email);
        this.changeInfoForm.get("phone")?.setValue(this.admin.phone);
        this._ProfileService.admin.next(res.data);
        // this.adminName = res.data.adminUserName;

      },
      error:(err)=>{

      }
    })
  }


  handleChangeInfo(changeInfoForm: FormGroup) {
    this.isLoading = true;
    this._ProfileService.changeInfo(changeInfoForm.value,this.adminId).subscribe({
      next:(res)=>{
        // this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message , key: 'bc'});
        Swal.fire({
          title:"Success",
          text:res.message + ", please login again!",
          icon:"success"
        })
        this._ProfileService.admin.next(res.data);
        this.isLoading = false;
        this._AuthService.logout();

      },
      error:(err)=>{
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message , key: 'bc'});
        this.isLoading = false;

      }
    })
  }
}
