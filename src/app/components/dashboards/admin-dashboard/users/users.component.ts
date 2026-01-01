import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AdminService} from "../../../../services/admin.service";
import {AuthService} from "../../../../services/auth.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {NgIf} from "@angular/common";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {IuserContentData} from "../../../../interfaces/iuser";
import {PaginatorModule} from "primeng/paginator";
import {AlphabeticalOrderPipe} from "../../../../pipes/alphabetical-order.pipe";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    ToastModule,
    ConfirmDialogModule,
    PaginatorModule,
    AlphabeticalOrderPipe
  ],
  providers:[MessageService,ConfirmationService],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit{


  updateUserForm:FormGroup = new FormGroup({
    userName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{1,20}$/)]),
    phone: new FormControl(null, [Validators.required,Validators.pattern(/^(010|011|012|015)[0-9]{8}$/)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
  });
  protected readonly Number = Number;

  users:IuserContentData[]=[];
  userId!:number;
  isLoading:boolean = false;
  adminId:number = 0;
  constructor(private _AdminService:AdminService, private _AuthService:AuthService,private confirmationService: ConfirmationService, private messageService: MessageService) {
  }

  first: number = 0;
  totalPages: number = 0;

  onPageChange(event: any) {
    this.first = event.first;
    this.isLoading = true;
    this._AdminService.getAllUsers(this.adminId,this.first).subscribe({
      next:(res)=>{
        this.users = res.data.content;
        this.totalPages = res.data.totalPages;
        this.isLoading =false;

      },
      error:(err)=>{
        this.isLoading =false;

      }
    })
  }

  ngOnInit(): void {
    this.isLoading = true;
    this._AuthService.decodeToken();

    this.adminId=this._AuthService.decodedTokenInfo.value.id;
    this._AdminService.getAllUsers(this.adminId, this.first).subscribe({
      next:(res)=>{
        this.users = res.data.content;
        this.totalPages = res.data.totalPages;
        this.isLoading = false;

      },
      error:(err)=>{
        this.isLoading = false;

      }
    })
  }

  handleDelete(event: Event,userId: number) {

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",

      accept: () => {
        this.isLoading = true;
        this._AdminService.deleteUser(userId,this.first).subscribe({
          next:(res)=>{
            this.isLoading = false;
            this.users = res.data.content;
            this.totalPages = res.data.totalPages;
            this.messageService.add({ severity: 'info', summary: 'Confirmed',key:'bc', detail: 'Record deleted' });

          },
          error:(err)=>{
            this.isLoading = false;

          }
        })
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected',key:'bc', detail: 'You have rejected' });
      }
    });


  }


  handleGetuser(id:number) {
    this._AdminService.getuser(id).subscribe({
      next:(res)=>{
        this.userId = res.data.userId;
        this.updateUserForm.get("userName")?.setValue(res.data.userName);
        this.updateUserForm.get("phone")?.setValue(res.data.phone);
        this.updateUserForm.get("email")?.setValue(res.data.email);
      },
      error:(err)=>{

      }
    })
  }


  handleUpdateUser(updateUserForm: FormGroup) {
    this.isLoading = true;
    this._AdminService.updateUser(updateUserForm.value,this.userId,this.first).subscribe({
      next:(res)=>{
        this.isLoading = false;
        this.users = res.data.content;
        this.totalPages = res.data.totalPages;

        this.messageService.add({ severity: 'success', summary: 'Success', key:'bc', detail: res.message });

      },
      error:(err)=>{
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error',key:'bc', detail: err.error.message });

      }
    })
  }
}
