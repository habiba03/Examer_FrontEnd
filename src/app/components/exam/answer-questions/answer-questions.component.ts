import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExamService } from "../../../services/exam.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormArray } from "@angular/forms";
import { NgForOf, TitleCasePipe } from "@angular/common";
import Swal from "sweetalert2";
import { SkeletonModule } from "primeng/skeleton";
import { CommonModule } from '@angular/common';
import { UserAnswerPayload } from "../../../interfaces/iuserAnswer";

@Component({
  selector: 'app-answer-questions',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe, NgForOf, SkeletonModule, CommonModule],
  templateUrl: './answer-questions.component.html',
  styleUrl: './answer-questions.component.scss'
})
export class AnswerQuestionsComponent implements OnInit, OnDestroy {

  examQuestion: any;
  examQuestions: any[] = [];
  examDuration: number = 0;
  examLength: number = 0;
  examTitle: string = '';
  username: string = '';
  currentQindex: number = 0;
  userAnswers: any[] = [];
  isEnded: boolean = false;
  isSubmitted: boolean = false;
  examId: any = '';
  isLoading: boolean = true;
  reloadCount: number = 0;

  secondsCount: number = 0;
  minutes: number = 0;
  remSeconds: number = 0;
  hours: number = 0;
  remMinutes: number = 0;
  countdownTimer: any;

  optionsForm: FormGroup = new FormGroup({
    answer: new FormControl(null, Validators.required),
    selectedOptions: new FormArray([]),
    writtenAnswer: new FormControl(null)
  });

  private visibilityChangeHandler: any;
  private fullscreenChangeHandler: any;
  private contextMenuHandler: any;
  private keydownHandler: any;

  constructor(
    private _ExamService: ExamService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router
  ) { }

  get selectedOptions(): FormArray {
    return this.optionsForm.get('selectedOptions') as FormArray;
  }

  ngOnInit(): void {
    this.examId = this._ActivatedRoute.snapshot.paramMap.get("id");

    this._ExamService.getExamQuestions(this.examId).subscribe({
      next: (res) => {
        this.enterFullScreen();
        this.disableShortcuts();
        this.detectTabSwitch();
        this.startCountdown();

        this.examLength = res.data.examQuestions.length;
        this.examQuestions = res.data.examQuestions;
        this.examDuration = res.data.examDuration;
        this.secondsCount = this.examDuration * 60;
        this.examTitle = res.data.examTitle;
        this.username = res.data.userName;

        console.log('Exam ID:', this.examId);

        this.currentQuestion();
        this.userAnswers = new Array(this.examLength).fill(null);

        if (this.currentQindex === this.examLength - 1) this.isEnded = true;
        this.isLoading = false;
      },
      error: (err) => {
        Swal.fire({
          title: "Error!",
          text: err.error.message,
          icon: "error"
        });
        this._Router.navigate(['/pages/home']);
      }
    });
  }

  ngOnDestroy(): void {
    this.cleanupListeners();
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  currentQuestion() {
    this.examQuestion = this.examQuestions[this.currentQindex] || null;
    this.setupFormForCurrentQuestion();
    this.loadSavedAnswer();
  }

  setupFormForCurrentQuestion() {
    this.selectedOptions.clear();

    if (this.examQuestion.questionType === 'MCQ' && this.allowsMultipleAnswers(this.examQuestion)) {
      this.examQuestion.options.forEach(() => this.selectedOptions.push(new FormControl(false)));
      this.optionsForm.get('answer')?.clearValidators();
      this.optionsForm.get('writtenAnswer')?.clearValidators();
    } else if (this.examQuestion.questionType === 'WRITTEN') {
      this.optionsForm.get('answer')?.clearValidators();
      this.optionsForm.get('writtenAnswer')?.setValidators([Validators.required, Validators.minLength(10)]);
    } else {
      this.optionsForm.get('answer')?.setValidators([Validators.required]);
      this.optionsForm.get('writtenAnswer')?.clearValidators();
    }

    this.optionsForm.get('answer')?.updateValueAndValidity();
    this.optionsForm.get('writtenAnswer')?.updateValueAndValidity();
  }

  loadSavedAnswer() {
    const savedAnswer = this.userAnswers[this.currentQindex];

    if (savedAnswer !== null && savedAnswer !== undefined) {
      if (this.examQuestion.questionType === 'WRITTEN') {
        this.optionsForm.get('writtenAnswer')?.setValue(savedAnswer);
      } else if (this.examQuestion.questionType === 'MCQ' && this.allowsMultipleAnswers(this.examQuestion)) {
        if (Array.isArray(savedAnswer)) {
          savedAnswer.forEach((checked: boolean, index: number) => {
            this.selectedOptions.at(index).setValue(checked);
          });
        }
      } else {
        this.optionsForm.get('answer')?.setValue(savedAnswer);
      }
    } else {
      this.optionsForm.reset();
    }
  }

  allowsMultipleAnswers(question: any): boolean {
    return question.correctOptionIndexes && question.correctOptionIndexes.length > 1;
  }

  onCheckboxChange(index: number) {
    const checkboxArray = this.selectedOptions;
    checkboxArray.at(index).setValue(!checkboxArray.at(index).value);
  }

  isFormValid(): boolean {
    if (this.examQuestion.questionType === 'WRITTEN') {
      const writtenAnswer = this.optionsForm.get('writtenAnswer')?.value;
      return writtenAnswer && writtenAnswer.trim().length >= 10;
    } else if (this.examQuestion.questionType === 'MCQ' && this.allowsMultipleAnswers(this.examQuestion)) {
      return this.selectedOptions.value.some((checked: boolean) => checked);
    } else {
      const answer = this.optionsForm.get('answer')?.value;
      return answer !== null && answer !== undefined && answer !== '';
    }
  }

  handleNextQuestion() {
    this.saveCurrentAnswer();

    if (this.currentQindex < this.examLength - 1) {
      this.currentQindex++;
      this.currentQuestion();
    }

    if (this.currentQindex === this.examLength - 1) this.isEnded = true;
  }

  handlePreviousQuestion() {
    this.saveCurrentAnswer();

    if (this.currentQindex > 0) {
      this.currentQindex--;
      this.currentQuestion();
      this.isEnded = false;
    }
  }

  saveCurrentAnswer() {
    if (this.examQuestion.questionType === 'WRITTEN') {
      const writtenAnswer = this.optionsForm.get('writtenAnswer')?.value;
      this.userAnswers[this.currentQindex] = writtenAnswer && writtenAnswer.trim() ? writtenAnswer.trim() : null;
    } else if (this.examQuestion.questionType === 'MCQ' && this.allowsMultipleAnswers(this.examQuestion)) {
      const selections = this.selectedOptions.value;
      const hasSelection = selections.some((checked: boolean) => checked);
      this.userAnswers[this.currentQindex] = hasSelection ? selections : null;
    } else {
      const answer = this.optionsForm.get('answer')?.value;
      this.userAnswers[this.currentQindex] = (answer !== null && answer !== undefined && answer !== '') ? answer : null;
    }
  }

  buildUserAnswerPayload(): UserAnswerPayload {
    const answers: any[] = [];

    this.userAnswers.forEach((answer, index) => {
      const question = this.examQuestions[index];
      
      // Skip unanswered questions (null or undefined)
      if (answer === null || answer === undefined) {
        return;
      }

      if (question.questionType === 'WRITTEN') {
        // Only add if written answer exists and is not empty
        if (typeof answer === 'string' && answer.trim().length > 0) {
          answers.push({
            questionId: question.questionId,
            writtenAnswer: answer.trim()
          });
        }
      } else if (question.questionType === 'MCQ' && this.allowsMultipleAnswers(question)) {
        // For multiple choice questions with checkboxes
        if (Array.isArray(answer)) {
          const selectedIndexes = answer
            .map((selected: boolean, idx: number) => selected ? idx : -1)
            .filter((idx: number) => idx !== -1);
          
          // Only add if at least one option is selected
          if (selectedIndexes.length > 0) {
            answers.push({
              questionId: question.questionId,
              selectedOptionIndexes: selectedIndexes
            });
          }
        }
      } else {
        // For single-choice MCQ (radio buttons)
        let selectedIndex = -1;
        
        // Try to find the index of the selected option
        if (typeof answer === 'string' || typeof answer === 'number') {
          selectedIndex = question.options.findIndex((opt: any) => {
            // Handle string options
            if (typeof opt === 'string') {
              return opt === answer;
            }
            // Handle object options with text/value properties
            if (typeof opt === 'object' && opt !== null) {
              return opt.text === answer || opt.value === answer || JSON.stringify(opt) === JSON.stringify(answer);
            }
            return false;
          });
        }
        
        // If answer is already an index number
        if (selectedIndex === -1 && typeof answer === 'number' && answer >= 0 && answer < question.options.length) {
          selectedIndex = answer;
        }
        
        // Only add if a valid option was selected
        if (selectedIndex !== -1) {
          answers.push({
            questionId: question.questionId,
            questionText: question.questionText,
            selectedOptionIndexes: [selectedIndex]
          });
        }
      }
    });

    const payload = {
      examSubmissionId: this.examId,
      answers: answers
    };

    console.log('Payload being sent:', JSON.stringify(payload, null, 2));
    return payload;
  }

  handleSubmit() {
    this.saveCurrentAnswer();
    
    const answeredCount = this.userAnswers.filter(a => a !== null && a !== undefined).length;
    
    if (answeredCount === 0) {
      Swal.fire({
        title: "No answers!",
        text: "Please answer at least one question before submitting.",
        icon: "warning"
      });
      return;
    }

    Swal.fire({
      title: "Submit Exam?",
      text: `You have answered ${answeredCount} out of ${this.examLength} questions. Do you want to submit?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, submit",
      cancelButtonText: "No, go back"
    }).then((result) => {
      if (result.isConfirmed) {
        this.submitExam();
      }
    });
  }

  submitExam() {
    const payload = this.buildUserAnswerPayload();

    this._ExamService.submitUserAnswers(payload).subscribe({
      next: (res: any) => {
        this.isSubmitted = true;
        this.optionsForm.disable();
        this.cleanupListeners();
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
        }

        Swal.fire({
          title: "Success!",
          text: res?.score !== undefined
            ? `Your exam was submitted successfully! Your score: ${res.score}`
            : "Your exam was submitted successfully!",
          icon: "success",
          allowOutsideClick: false,
          confirmButtonText: "OK",
        }).then(() => {
          this.exitFullScreen();
          this._Router.navigate(['/pages/home']);
        });
      },
      error: (err) => {
        Swal.fire({
          title: "Error!",
          text: err.error?.message || "Failed to submit answers",
          icon: "error",
        });
      }
    });
  }

  AutoSubmitExam() {
    if (this.isSubmitted) return;
    
    this.saveCurrentAnswer();
    const payload = this.buildUserAnswerPayload();

    Swal.fire({
      title: "Time is up!",
      text: "Your exam will be submitted automatically.",
      icon: "info",
      allowOutsideClick: false,
      confirmButtonText: "OK",
    }).then(() => {
      this._ExamService.submitUserAnswers(payload).subscribe({
        next: (res: any) => {
          this.isSubmitted = true;
          this.optionsForm.disable();
          this.cleanupListeners();
          if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
          }
          
          Swal.fire({
            title: "Success!",
            text: res?.score !== undefined
              ? `Your exam was submitted successfully! Your score: ${res.score}`
              : "Your exam was submitted successfully!",
            icon: "success",
            allowOutsideClick: false,
            confirmButtonText: "OK",
          }).then(() => {
            this.exitFullScreen();
            this._Router.navigate(['/pages/home']);
          });
        },
        error: (err) => {
          Swal.fire({
            title: "Error!",
            text: err.error?.message || "Failed to submit answers",
            icon: "error",
          });
        }
      });
    });
  }

  detectTabSwitch() {
    this.visibilityChangeHandler = () => {
      if (this.isSubmitted) return;
      if (document.hidden && !this.isSubmitted) {
        this.saveCurrentAnswer();

        Swal.fire({
          title: "You caught!",
          text: "You are not allowed to switch tabs during the exam, your exam will be submitted automatically.",
          icon: "warning",
          allowOutsideClick: false,
          confirmButtonText: "OK",
        }).then(() => this.AutoSubmitExam());
      }
    };
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  enterFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.warn('Failed to enter fullscreen:', err);
      });
    }
    
    this.fullscreenChangeHandler = this.handleFullScreenChange.bind(this);
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
  }

  handleFullScreenChange() {
    if (this.isSubmitted) return;
    if (!document.fullscreenElement) {
      Swal.fire({
        title: "Note",
        text: "You are not allowed to leave this screen. If you navigate to another tab, your exam will be submitted automatically.",
        icon: "info",
        confirmButtonText: "Ok, got it",
      });
    }
  }

  disableShortcuts() {
    this.contextMenuHandler = (event: MouseEvent) => { 
      if (!this.isSubmitted) event.preventDefault(); 
    };
    
    this.keydownHandler = (event: KeyboardEvent) => {
      if (this.isSubmitted) return;
      
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        this.reloadCount++;
        if (this.reloadCount > 1) {
          this.AutoSubmitExam();
        } else {
          Swal.fire({
            title: "Warning!",
            text: "Reloading the page is not allowed. If you reload again, your exam will be submitted automatically.",
            icon: "warning",
            allowOutsideClick: false,
            confirmButtonText: "OK",
          });
        }
      }
      
      if ((event.ctrlKey && ['c', 'v', 'x', 'a', 's'].includes(event.key.toLowerCase())) || event.key === 'F12') {
        event.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', this.contextMenuHandler);
    document.addEventListener('keydown', this.keydownHandler);
  }

  startCountdown() {
    this.countdownTimer = setInterval(() => {
      if (this.isSubmitted) { 
        clearInterval(this.countdownTimer); 
        return; 
      }

      this.minutes = Math.floor(this.secondsCount / 60);
      this.remSeconds = this.secondsCount % 60;
      this.hours = Math.floor(this.minutes / 60);
      this.remMinutes = this.minutes % 60;

      if (this.secondsCount > 0) {
        this.secondsCount--;
      } else { 
        clearInterval(this.countdownTimer); 
        this.AutoSubmitExam(); 
      }
    }, 1000);
  }

  exitFullScreen() {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.warn('Failed to exit fullscreen:', err);
      });
    }
  }

  cleanupListeners() {
    if (this.fullscreenChangeHandler) {
      document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
    }
    if (this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    }
    if (this.contextMenuHandler) {
      document.removeEventListener('contextmenu', this.contextMenuHandler);
    }
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
  }
}