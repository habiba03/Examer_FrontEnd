import {Component, OnInit} from '@angular/core';
import {AdminService} from "../../../../services/admin.service";
import {AuthService} from "../../../../services/auth.service";
import {DropdownModule} from "primeng/dropdown";
import {PaginatorModule} from "primeng/paginator";
import {MessageService, PrimeTemplate} from "primeng/api";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IscoreContentData} from "../../../../interfaces/iscore";
import {ToastModule} from "primeng/toast";
import {NgClass} from "@angular/common";
import {BehaviorSubject} from "rxjs";
import {AlphabeticalOrderPipe} from "../../../../pipes/alphabetical-order.pipe";
import {Router} from "@angular/router";


@Component({
  selector: 'app-score',
  standalone: true,
  imports: [
    DropdownModule,
    PaginatorModule,
    PrimeTemplate,
    ReactiveFormsModule,
    FormsModule,
    ToastModule,
    NgClass,
    AlphabeticalOrderPipe
  ],
  providers: [MessageService],
  templateUrl: './score.component.html',
  styleUrl: './score.component.scss'
})
export class ScoreComponent implements OnInit {

  examsName: any[] = [];
  exams: any[] = [];
  adminId = 0;

  results = new BehaviorSubject<IscoreContentData[]>([]);
  filteredResults: IscoreContentData[] = [];
  isLoading = true;

  searchTerm: string = '';

  total_mark = 0;
  passMark = 0;

  examId!: number;
  first = 0;
  totalPages = 0;

  constructor(
    private _AdminService: AdminService,
    private _AuthService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this._AuthService.decodeToken();
    this.adminId = this._AuthService.decodedTokenInfo.value.id;

    this._AdminService.getAdminExamsList(this.adminId).subscribe({
      next: (res) => {
        this.exams = res.data;
        this.examsName = this.exams.map((exam: any) => ({
          name: exam.examTitle,
          id: exam.examId
        }));
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  handleDropDown(event: any) {
    this.examId = event.value.id;
    this.first = 0;
    this.searchTerm = '';
    this.filteredResults = [];
    this.loadData();
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.loadData();
  }
 
  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredResults = this.results.value;
    } else {
      this.filteredResults = this.results.value.filter(res =>
        res.userName.toLowerCase().includes(term)
      );
    }
  }

  loadData() {
    this.isLoading = true;

    this._AdminService
      .getUsersForAdminExam(this.examId, this.adminId, this.first)
      .subscribe({
        next: (res) => {
          this.results.next(res.data.content);
          this.filteredResults = res.data.content;
          this.onSearch();
          this.totalPages = res.data.totalPages;

          if (res.data.content.length > 0) {
            this.total_mark = res.data.content[0].totalMark;
            this.passMark = Math.ceil(0.5 * this.total_mark);
          }

          this.isLoading = false;
        },
        error: (err) => {
          this.results.next([]);
          this.filteredResults = [];
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error.message
          });
        }
      });
  }

  handleReset(user: any) {
    let resetData = {
      userId: user.userId,
      examId: this.examId
    }
    this._AdminService.resetUserExam(resetData).subscribe({
      next: (res) => {
        const updated = this.results.value.filter(u => u.userId !== user.userId);
        this.results.next(updated);
        this.filteredResults = updated;
        this.onSearch();
        this.messageService.add({severity: 'success', summary: 'Success', detail: res.message, key: 'bc'});
      },
      error: (err) => {
        this.messageService.add({severity: 'error', summary: 'Error!', detail: err.error.message, key: 'bc'});
      }
    })
  }

  viewAnswers(res: IscoreContentData) {
    this.router.navigate([
      '/dashboard/admin/viewUserAnswers',
      res.examSubmissionId,
      res.userName,
      res.examName,
      res.score
    ]);
  }

  viewImage(res: any) {
    this.router.navigate([
      '/dashboard/admin/viewImages',
      this.examId,
      res.userId
    ]);
  }
}
