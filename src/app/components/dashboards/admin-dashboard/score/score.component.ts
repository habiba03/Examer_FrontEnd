import {Component, OnInit} from '@angular/core';
import {AdminService} from "../../../../services/admin.service";
import {AuthService} from "../../../../services/auth.service";
import {DropdownModule} from "primeng/dropdown";
import {PaginatorModule} from "primeng/paginator";
import {MessageService, PrimeTemplate} from "primeng/api";
import {ReactiveFormsModule} from "@angular/forms";
import {IscoreContentData} from "../../../../interfaces/iscore";
import {ToastModule} from "primeng/toast";
import {NgClass} from "@angular/common";
import {BehaviorSubject} from "rxjs";
import {AlphabeticalOrderPipe} from "../../../../pipes/alphabetical-order.pipe";

@Component({
  selector: 'app-score',
  standalone: true,
  imports: [
    DropdownModule,
    PaginatorModule,
    PrimeTemplate,
    ReactiveFormsModule,
    ToastModule,
    NgClass,
    AlphabeticalOrderPipe
  ],
  providers:[MessageService],
  templateUrl: './score.component.html',
  styleUrl: './score.component.scss'
})
export class ScoreComponent implements OnInit{
  examsName: any[]=[];
  exams:any[]=[];
  adminId:number = 0;
  results= new BehaviorSubject<IscoreContentData[]>([]);
  isLoading:boolean=true;
  total_mark:number = 0;
  passMark:number = 0;
  private examId: any;

  constructor(private _AdminService:AdminService, private _AuthService:AuthService, private messageService:MessageService) {
  }

  first: number = 0;
  totalPages: number = 0;

  onPageChange(event: any) {
    this.first = event.first;
    this.isLoading = true;
    this._AdminService.getUsersForAdminExam(this.examId, this.adminId, this.first).subscribe({
      next:(res)=>{
        this.results.next(res.data.content);
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
    this.adminId = this._AuthService.decodedTokenInfo.value.id;
    this._AdminService.getAdminExamsList(this.adminId).subscribe({
      next:(res)=>{
        this.exams = res.data;
        for(let exam of this.exams){
          let examName = { name : exam.examTitle, id:exam.examId, total_mark:exam.totalQuestions};
          this.examsName.push(examName);

        }
        this.isLoading=false;
      },
      error:(err)=>{
        this.isLoading=false;

      }
    })
  }


  handleDropDown(event: any) {
    this.examId = event.value.id;
    this.total_mark = event.value.total_mark;
    this.passMark = Math.ceil(0.5 * event.value.total_mark);
    this.isLoading = true;
    this.first = 0; // Reset pagination to the first page when a new exam is selected
    this._AdminService.getUsersForAdminExam(this.examId, this.adminId, this.first).subscribe({
      next:(res)=>{
        this.results.next(res.data.content);
        this.totalPages = res.data.totalPages;
        this.isLoading = false;

      },error:(err)=>{
        this.results.next([]);
        this.totalPages = 0;
        this.isLoading=false;
        this.messageService.add({severity:'error',summary:'Error!',detail:err.error.message,key:'bc'});

      }
    })
  }

  handleReset(user:any) {
    let resetData = {
      userId:user.userId,
      examId:this.examId
    }
    this._AdminService.resetUserExam(resetData).subscribe({
      next:(res)=>{
        const updated = this.results.value.filter(u => u.userId !== user.userId);
        this.results.next(updated);
        this.messageService.add({severity:'success',summary:'Success',detail:res.message,key:'bc'});
      },
      error:(err)=>{
        this.messageService.add({severity:'error',summary:'Error!',detail:err.error.message,key:'bc'});
      }
    })
  }
}
