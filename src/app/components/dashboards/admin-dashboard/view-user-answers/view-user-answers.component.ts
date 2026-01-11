import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import Swal from 'sweetalert2';
import { ExamService } from '../../../../services/exam.service';
import { IUserAnswerView } from '../../../../interfaces/iviewAnswers';

@Component({
  selector: 'app-view-student-answers',
  standalone: true,
  imports: [CommonModule, SkeletonModule],
  templateUrl: './view-user-answers.component.html',
  styleUrls: ['./view-user-answers.component.scss'],
})
export class ViewUserAnswersComponent implements OnInit {
  submissionId!: number;
  isLoading: boolean = true;
  studentName: string = 'Student';
  examTitle: string = 'Exam Details';
  score: number = 0;
  questionsWithAnswers: IUserAnswerView[] = [];

  private _ExamService = inject(ExamService);
  private _ActivatedRoute = inject(ActivatedRoute);
  private _Router = inject(Router);

  ngOnInit(): void {
    this.submissionId = Number(this._ActivatedRoute.snapshot.paramMap.get('submissionId'));

    this._ActivatedRoute.queryParams.subscribe((params) => {
      this.studentName = this._ActivatedRoute.snapshot.paramMap.get('userName') || 'Student';
      this.examTitle = this._ActivatedRoute.snapshot.paramMap.get('examName') || 'Exam Details';
      this.score = Number(this._ActivatedRoute.snapshot.paramMap.get('score')) || 0;
    });

    this.loadStudentAnswers();
  }

  loadStudentAnswers() {
    this.isLoading = true;

    this._ExamService.getUserAnswersBySubmission(this.submissionId).subscribe({
      next: (res) => {
        console.log('API RESPONSE:', res);
        this.questionsWithAnswers = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error!',
          text: err.error?.message || 'Failed to load student answers',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        this.goBack();
      },
    });
  }

  // Get option letter (A, B, C, D...)
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Get word count for written answers
  getWordCount(text: string): number {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  }

  // Get question status based on answers
  getQuestionStatus(question: IUserAnswerView): string {
    // Written question
    if (question.writtenAnswer && question.writtenAnswer.trim() !== '') {
      return 'Answered';
    }

    // MCQ/TF question
    if (question.selectedOptions && question.selectedOptions.length > 0) {
      const allCorrect = question.selectedOptions.every(opt => opt.isCorrect);
      const anyCorrect = question.selectedOptions.some(opt => opt.isCorrect);

      if (allCorrect) {
        return 'All Correct';
      } else if (anyCorrect) {
        return 'Partially Correct';
      } else {
        return 'Incorrect';
      }
    }

    return 'Not Answered';
  }

  // Get CSS class for status badge
  getStatusClass(question: IUserAnswerView): string {
    const status = this.getQuestionStatus(question);
    
    const baseClass = 'badge fs-6 px-3 py-2 ';
    
    switch (status) {
      case 'All Correct':
        return baseClass + 'bg-success';
      case 'Partially Correct':
        return baseClass + 'bg-warning text-dark';
      case 'Incorrect':
        return baseClass + 'bg-danger';
      case 'Answered':
        return baseClass + 'bg-info text-dark';
      case 'Not Answered':
        return baseClass + 'bg-secondary';
      default:
        return baseClass + 'bg-secondary';
    }
  }

  goBack() {
    this._Router.navigate(['/dashboard/admin/score']);
  }
}