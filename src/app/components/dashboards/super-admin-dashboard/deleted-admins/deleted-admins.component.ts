import {Component, OnInit} from '@angular/core';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {PaginatorModule} from "primeng/paginator";
import {ToastModule} from "primeng/toast";
import {IadminData} from "../../../../interfaces/iadmin";
import {SuperAdminService} from "../../../../services/super-admin.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {TooltipModule} from "primeng/tooltip";

@Component({
  selector: 'app-deleted-admins',
  standalone: true,
  imports: [
    ConfirmDialogModule,
    PaginatorModule,
    ToastModule,
    TooltipModule
  ],
  providers:[ConfirmationService, MessageService],
  templateUrl: './deleted-admins.component.html',
  styleUrl: './deleted-admins.component.scss'
})
export class DeletedAdminsComponent implements OnInit{
  admins:IadminData[]=[];
  isLoading:boolean=true;
  constructor(private _SuperAdminService:SuperAdminService,private confirmationService: ConfirmationService, private messageService: MessageService) {
  }

  first: number = 0;
  totalPages: number = 0;

  onPageChange(event: any) {
    this.first = event.first;
    this.isLoading = true;
    this._SuperAdminService.getDeletedAdmin(this.first).subscribe({
      next:(res)=>{
        this.admins = res.data.content;
        this.totalPages = res.data.totalPages;
        this.isLoading =false;

      },
      error:(err)=>{
        this.isLoading =false;

      }
    })
  }

  ngOnInit(): void {
    this._SuperAdminService.getDeletedAdmin(this.first).subscribe({
      next:(res)=>{
        this.admins = res.data.content;
        this.totalPages = res.data.totalPages;
        this.isLoading = false;

      },
      error:(err)=>{
        this.isLoading =false;

      }
    })
  }




  handleDelete(event: Event,adminId: number) {

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",

      accept: () => {
        this._SuperAdminService.hardDeleteAdmin(adminId,this.first).subscribe({
          next:(res)=>{
            this.admins = res.data.content;
            this.messageService.add({ severity: 'info', summary: 'Confirmed',key:'bc', detail: 'Record deleted' });

          },
          error:(err)=>{
            this.isLoading =false;

          }
        })
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected',key:'bc', detail: 'You have rejected' });
      }
    });


  }

  handleRestore(event: MouseEvent, adminId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to restore this admin?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-info p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",

      accept: () => {
        this._SuperAdminService.restoreAdmin({adminId:adminId},this.first).subscribe({
          next:(res)=>{
            this.admins = res.data.content;
            this.messageService.add({ severity: 'info', summary: 'Confirmed',key:'bc', detail: 'Admin Restored' });

          },
          error:(err)=>{
            this.isLoading =false;

          }
        })
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected',key:'bc', detail: 'You have rejected' });
      }
    });
  }
}
