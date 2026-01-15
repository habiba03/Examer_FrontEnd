import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AdminService} from "../../../../services/admin.service";
import {AuthService} from "../../../../services/auth.service";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    ToastModule,
    ReactiveFormsModule
  ],
  providers:[MessageService],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {
  addUserForm:FormGroup = new FormGroup({
    userName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z_]{1,20}$/)]),
    phone: new FormControl(null, [Validators.required, Validators.pattern(/^(010|011|012|015)[0-9]{8}$/)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
  })
  isLoading:boolean = false;

  constructor(private _AdminService:AdminService, private _AuthService:AuthService,private messageService:MessageService) {
  }

  handleAddUser(addUserForm: FormGroup) {
    this.isLoading = true;
    this._AuthService.decodeToken();
    let adminId=this._AuthService.decodedTokenInfo.value.id;
    const formData = { ...addUserForm.value, adminId: adminId };

    this._AdminService.addUser(formData).subscribe({
      next:(res)=>{
        this.messageService.add({ severity: 'success', summary: 'Success', key:'bc', detail: res.message });
        this.isLoading = false;

      },error:(err)=>{
        this.messageService.add({ severity: 'error', summary: 'Error',key:'bc', detail: err.error.message });
        this.isLoading = false;

      }
    })
  }

}
