import {Component, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {AdminService} from "../../../../services/admin.service";
import {IexamContentData} from "../../../../interfaces/iexam";
import {AuthService} from "../../../../services/auth.service";
import {MessageService,ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {DatePipe, NgForOf} from "@angular/common";
import {SkeletonModule} from "primeng/skeleton";
import {PaginatorModule} from "primeng/paginator";


@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [
    RouterLink,
    ConfirmDialogModule,
    ToastModule,
    DatePipe,
    NgForOf,
    SkeletonModule,
    PaginatorModule

  ],
  providers:[MessageService,ConfirmationService],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.scss'
})
export class ExamsComponent implements OnInit{

  exams:IexamContentData[]=[];
  isLoading:boolean=true;
  adminId:number=0;
  constructor(private _AdminService:AdminService, private _AuthService:AuthService,private confirmationService: ConfirmationService, private messageService:MessageService) {
  }

  first: number = 0;
  totalPages: number = 0;

  onPageChange(event: any) {
    this.first = event.first;
    this.isLoading = true;
    this._AdminService.getAllExams(this.adminId,this.first).subscribe({
      next:(res)=>{
        this.exams = res.data.content;
        this.totalPages = res.data.totalPages;
        this.isLoading =false;

      },
      error:(err)=>{
        this.isLoading =false;

      }
    })
  }

  ngOnInit(): void {
    this._AuthService.decodeToken();
    this.adminId= this._AuthService.decodedTokenInfo.value.id;
    this._AdminService.getAllExams(this.adminId,this.first).subscribe({
      next:(res)=>{
        this.exams = res.data.content;
        this.totalPages = res.data.totalPages;
        this.isLoading = false;

      },
      error:(err)=>{

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
        this.isLoading=true;
        this._AdminService.deleteExam(adminId).subscribe({
          next:(res)=>{
            this.exams = res.data.content;
            this.isLoading=false;

          },
          error:(err)=>{

          }
        })
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected',key:'bc', detail: 'You have rejected' });
      }
    });


  }




}
