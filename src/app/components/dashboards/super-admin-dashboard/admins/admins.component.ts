import {Component, OnInit} from '@angular/core';
import {SuperAdminService} from "../../../../services/super-admin.service";
import {IadminData} from "../../../../interfaces/iadmin";
import {ConfirmationService, MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {PaginatorModule} from "primeng/paginator";
import {AlphabeticalOrderPipe} from "../../../../pipes/alphabetical-order.pipe";


@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [ToastModule, ConfirmDialogModule, PaginatorModule, AlphabeticalOrderPipe],
  providers: [ConfirmationService, MessageService],
  templateUrl: './admins.component.html',
  styleUrl: './admins.component.scss'
})


export class AdminsComponent implements OnInit{

  admins:IadminData[]=[];
  isLoading:boolean=true;
  constructor(private _SuperAdminService:SuperAdminService,private confirmationService: ConfirmationService, private messageService: MessageService) {
  }

  first: number = 0;
  totalPages: number = 0;

  onPageChange(event: any) {
    this.first = event.first;
    this.isLoading = true;
    this._SuperAdminService.getAllAdmins(this.first).subscribe({
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
    this._SuperAdminService.getAllAdmins(this.first).subscribe({
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
        this._SuperAdminService.deleteAdmin(adminId,this.first).subscribe({
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
}
