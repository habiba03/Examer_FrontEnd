import {Component, OnInit} from '@angular/core';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {PaginatorModule} from "primeng/paginator";
import {ToastModule} from "primeng/toast";
import {ConfirmationService, MessageService} from "primeng/api";
import {TooltipModule} from "primeng/tooltip";
import {IuserContentData} from "../../../../interfaces/iuser";
import {AdminService} from "../../../../services/admin.service";
import {AuthService} from "../../../../services/auth.service";

@Component({
  selector: 'app-deleted-users',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    PaginatorModule,
    ToastModule,
    TooltipModule
  ],
  providers:[ConfirmationService, MessageService],
  templateUrl: './deleted-users.component.html',
  styleUrl: './deleted-users.component.scss'
})
export class DeletedUsersComponent implements OnInit{
  users:IuserContentData[]=[];
  isLoading:boolean = false;
  adminId:number = 0;
  constructor(private _AdminService:AdminService, private _AuthService:AuthService,private confirmationService: ConfirmationService, private messageService: MessageService) {
  }

  first: number = 0;
  totalPages: number = 0;

  onPageChange(event: any) {
    this.first = event.first;
    this.isLoading = true;
    this._AdminService.getDeletedUsers(this.adminId,this.first).subscribe({
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
    this._AdminService.getDeletedUsers(this.adminId, this.first).subscribe({
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
        this._AdminService.hardDeleteUser(userId,this.first).subscribe({
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

  handleRestore(event: MouseEvent, userId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to restore this user?',
      header: 'Restore Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-info p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",

      accept: () => {
        this.isLoading = true;
        this._AdminService.restoreDeletedUser({userId:userId}, this.first).subscribe({
          next:(res)=>{
            this.users = res.data.content;
            this.totalPages = res.data.totalPages;
            this.messageService.add({ severity: 'info', summary: 'Confirmed',key:'bc', detail: 'User Restored' });
            this.isLoading = false;

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
}
