import {Component, OnInit} from '@angular/core';
import {AdminService} from "../../../../services/admin.service";
import {AuthService} from "../../../../services/auth.service";
import {ActivatedRoute} from "@angular/router";
import {DropdownModule} from "primeng/dropdown";
import {MessageService, PrimeTemplate} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {PaginatorModule} from "primeng/paginator";
import {TitleCasePipe} from "@angular/common";
import {MultiSelectModule} from "primeng/multiselect";

@Component({
  selector: 'app-add-user-to-exam',
  standalone: true,
  imports: [
    DropdownModule,
    PrimeTemplate,
    ToastModule,
    PaginatorModule,
    TitleCasePipe,
    MultiSelectModule
  ],
  providers:[MessageService],
  templateUrl: './add-user-to-exam.component.html',
  styleUrl: './add-user-to-exam.component.scss'
})
export class AddUserToExamComponent implements OnInit{

  users:any[]=[];
  usersName:any[]=[];
  examId:number = 0;
  examName:string|null='';
  assignedUsers:any[]=[];
  assignedData:any;
  isLoading:boolean = false;
  isSelected:boolean =false;
  adminId:number = 0;
  constructor(private _AdminService:AdminService, private _AuthService:AuthService, private _ActivatedRoute:ActivatedRoute, private messageService:MessageService) {
  }

  first: number = 0;
  totalPages: number = 0;
  selectedUsers:any[]=[];

  onPageChange(event: any) {
    this.first = event.first;
    this.isLoading = true;
    this._AdminService.usersOfAdminAndStatus(this.examId,this.adminId,this.first).subscribe({
      next:(res)=>{
        this.assignedUsers = res.data.content;
        this.totalPages = res.data.totalPages;
        this.isLoading =false;

      },
      error:(err)=>{
        this.isLoading =false;

      }
    })
  }

  ngOnInit(): void {
    this.isLoading=true;
    this._AuthService.decodeToken();
    this.adminId = this._AuthService.decodedTokenInfo.value.id;
    this.examId = Number(this._ActivatedRoute.snapshot.paramMap.get("id"));
    this.examName = this._ActivatedRoute.snapshot.paramMap.get("examName");
    this._AdminService.getAdminUsersAndNotAssigned(this.examId,this.adminId).subscribe({
      next:(res)=>{
        this.users = res.data;
        for(let user of this.users){
          let userName = { name : user.userName, id:user.userId};
          this.usersName.push(userName);
        }

      },
      error:(err)=>{

      }
    });

    this._AdminService.usersOfAdminAndStatus(this.examId,this.adminId, this.first).subscribe({
      next:(res)=>{
        this.assignedUsers = res.data.content;
        this.totalPages = res.data.totalPages;
        this.isLoading=false;

      },
      error:(err)=>{

      }
    })
  }


  handleDropDown(event: any) {
    if(event){
      this.isSelected = true;
    }
    this.assignedData = {
      examId: this.examId,
      userId:event.value.id
    }
  }
  // handleMultiselect(event: any) {
  //   debugger
  //   this.assignedData = {
  //     examId: this.examId,
  //     assignedUsers: this.selectedUsers
  //   }
  // }

  handleAssignUsers(){
    this.isLoading = true;
    this._AdminService.assignUsertoExam(this.assignedData,this.first).subscribe({
      next:(res)=>{
        this.assignedUsers = res.data.content;
        this.totalPages = res.data.totalPages;
        this.users = this.users.filter((user)=> user.userId !== this.assignedData.userId);
        this.usersName = [];
        this.isSelected = false;
        for(let user of this.users){
          let userName = { name : user.userName, id:user.userId};
          this.usersName.push(userName);
        }
        this.isLoading = false;
        this.messageService.add({severity:"success",summary:"Success",detail:res.message,key:"bc"});

      },
      error:(err)=>{
        this.isLoading = false;
        this.messageService.add({severity:"error",summary:"Error",detail:err.error.message,key:"bc"})

      }
    });
  }
}
