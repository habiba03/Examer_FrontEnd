import { Component } from '@angular/core';
import {SuperAdminService} from "../../../../services/super-admin.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-add-admin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ToastModule
  ],
  providers:[MessageService],
  templateUrl: './add-admin.component.html',
  styleUrl: './add-admin.component.scss'
})
export class AddAdminComponent {

  addAdminForm:FormGroup = new FormGroup({
    adminUserName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{1,20}$/)]),
    phone: new FormControl(null, [Validators.required, Validators.pattern(/^(010|011|012|015)[0-9]{8}$/)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
  })

  isLoading:boolean = false;

  constructor(private _SuperAdminService:SuperAdminService, private messageService:MessageService) {
  }


  handleAddAdmin(addAdminForm: FormGroup) {
    this.isLoading = true;
    this._SuperAdminService.addAdmin(addAdminForm.value).subscribe({
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
