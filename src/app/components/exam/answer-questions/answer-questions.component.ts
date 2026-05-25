import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ExamService } from '../../../services/exam.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { NgForOf, TitleCasePipe, CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { SkeletonModule } from 'primeng/skeleton';
import { UserAnswerPayload } from '../../../interfaces/iuserAnswer';
import { ProctoringService } from '../../../services/proctoring.service';

@Component({
  selector: 'app-answer-questions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    NgForOf,
    SkeletonModule,
    CommonModule,
  ],
  templateUrl: './answer-questions.component.html',
  styleUrls: ['./answer-questions.component.scss'],
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
  examId: string = '';
  userId: string = '';
  isLoading: boolean = true;
  reloadCount: number = 0;
  score: number | null = null;
  submitRetryCount: number = 0;
  isSubmitting: boolean = false;
  lastSubmitPayload: any = null; 

  secondsCount: number = 0;
  minutes: number = 0;
  remSeconds: number = 0;
  hours: number = 0;
  remMinutes: number = 0;
  countdownTimer: any;
  pendingSnapshots: any[] = [];
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  private proctoringTimer: any;

  optionsForm: FormGroup = new FormGroup({
    answer: new FormControl(null, Validators.required),
    selectedOptions: new FormArray([]),
    writtenAnswer: new FormControl(null),
  });

  private visibilityChangeHandler: any;
  private fullscreenChangeHandler: any;
  private contextMenuHandler: any;
  private keydownHandler: any;

  constructor(
    private _ExamService: ExamService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private _ProctoringService: ProctoringService
  ) {}

  get selectedOptions(): FormArray {
    return this.optionsForm.get('selectedOptions') as FormArray;
  }

  ngOnInit(): void {
    this.examId = this._ActivatedRoute.snapshot.paramMap.get('id') || '';
    this.userId = this._ActivatedRoute.snapshot.paramMap.get('userId') || '';

    this._ExamService.getExamQuestions(this.examId).subscribe({
      next: (res) => {
        this.examQuestions = res.data.examQuestions;
        this.examLength = this.examQuestions.length;
        this.examDuration = res.data.examDuration;
        this.secondsCount = this.examDuration * 60;
        this.examTitle = res.data.examTitle;
        this.username = res.data.userName;

        this.userAnswers = new Array(this.examLength).fill(null);
        this.currentQuestion();

        this.isEnded = this.currentQindex === this.examLength - 1;
        this.isLoading = false;

        this.startCountdown();
        this.startProctoring();
        this.enterFullScreen();
        this.disableShortcuts();
        this.detectTabSwitch();
      },
      error: (err) => {
        Swal.fire({ title: 'Error!', text: err.error?.message || 'Failed to load exam', icon: 'error' });
        this._Router.navigate(['/pages/home']);
      },
    });
    window.addEventListener('online', () => {
  this.retryPendingSnapshots();
});
  }

  ngOnDestroy(): void {
    this.cleanupListeners();
    clearInterval(this.countdownTimer);
    clearInterval(this.proctoringTimer);
    this.stopCamera();
  }

  async startProctoring() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = stream;

      this.proctoringTimer = setInterval(() => {
        if (!this.isSubmitted) this.captureAndUpload();
      }, 10000);
    } catch (err) {
      Swal.fire(
        'Camera Required',
        'You must allow camera access to take the exam',
        'error'
      );
      this._Router.navigate(['/pages/home']);
    }
  }

  stopCamera() {
    if (this.videoElement?.nativeElement?.srcObject) {
      const stream = this.videoElement.nativeElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      this.videoElement.nativeElement.srcObject = null;
    }
    clearInterval(this.proctoringTimer);
  }

  captureAndUpload() {
    if (this.isSubmitted) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context && video.videoWidth > 0) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.7);

      const snapshot = {
      image: imageBase64,
      examId: this.examId,
      userId: this.userId,
      timestamp: new Date().toISOString()
    };

    this.uploadOrStoreSnapshot(snapshot);
    }
  }
uploadOrStoreSnapshot(snapshot: any) {

  if (!navigator.onLine) {
    this.storeSnapshot(snapshot);
    return;
  }

  this._ProctoringService
    .uploadSnapshot(snapshot.image, snapshot.examId, snapshot.userId)
    .subscribe({
      next: () => {
        console.log('Snapshot uploaded');
      },

      error: () => {
        this.storeSnapshot(snapshot);
      }
    });
}
 storeSnapshot(snapshot: any) {
  const storageKey = `exam_${snapshot.examId}_snapshots`;

  let snapshots = JSON.parse(localStorage.getItem(storageKey) || '[]');
  snapshots.push(snapshot);

  localStorage.setItem(storageKey, JSON.stringify(snapshots));
  console.log('Snapshot stored locally');
}
 retryPendingSnapshots() {
  const storageKey = `exam_${this.examId}_snapshots`;
  const stored = localStorage.getItem(storageKey);

  if (stored && navigator.onLine) {
    const snapshots = JSON.parse(stored);

    snapshots.forEach((snapshot: any) => {
      this._ProctoringService
        .uploadSnapshot(snapshot.image, snapshot.examId, snapshot.userId)
        .subscribe({
          next: () => {},
          error: () => {
            console.log('Failed to upload stored snapshot');
          }
        });
    });

    localStorage.removeItem(storageKey);
    console.log('Retried pending snapshots');
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
        if (Array.isArray(savedAnswer)) savedAnswer.forEach((v: boolean, i: number) => this.selectedOptions.at(i).setValue(v));
      } else {
        this.optionsForm.get('answer')?.setValue(savedAnswer);
      }
    } else this.optionsForm.reset();
  }

  allowsMultipleAnswers(question: any): boolean {
    return question.correctOptionIndexes?.length > 1;
  }

  onCheckboxChange(index: number) {
    const checkboxArray = this.selectedOptions;
    checkboxArray.at(index).setValue(!checkboxArray.at(index).value);
  }

  isFormValid(): boolean {
    if (this.examQuestion.questionType === 'WRITTEN') {
      const ans = this.optionsForm.get('writtenAnswer')?.value;
      return ans && ans.trim().length >= 10;
    } else if (this.examQuestion.questionType === 'MCQ' && this.allowsMultipleAnswers(this.examQuestion)) {
      return this.selectedOptions.value.some((v: boolean) => v);
    } else {
      const ans = this.optionsForm.get('answer')?.value;
      return ans !== null && ans !== undefined && ans !== '';
    }
  }

  handleNextQuestion() {
    this.saveCurrentAnswer();
    if (this.currentQindex < this.examLength - 1) {
      this.currentQindex++;
      this.currentQuestion();
    }
    this.isEnded = this.currentQindex === this.examLength - 1;
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
      const ans = this.optionsForm.get('writtenAnswer')?.value;
      this.userAnswers[this.currentQindex] = ans?.trim() || null;
    } else if (this.examQuestion.questionType === 'MCQ' && this.allowsMultipleAnswers(this.examQuestion)) {
      const selections = this.selectedOptions.value;
      this.userAnswers[this.currentQindex] = selections.some((v: boolean) => v) ? selections : null;
    } else {
      const ans = this.optionsForm.get('answer')?.value;
      this.userAnswers[this.currentQindex] = ans ?? null;
    }
  }

  buildUserAnswerPayload(): UserAnswerPayload {
    const answers: any[] = [];
    this.userAnswers.forEach((ans, idx) => {
      const q = this.examQuestions[idx];
      if (!ans) return;
      if (q.questionType === 'WRITTEN') answers.push({ questionId: q.questionId, writtenAnswer: ans });
      else if (q.questionType === 'MCQ' && this.allowsMultipleAnswers(q)) {
        const selected = ans.map((v: boolean, i: number) => (v ? i : -1)).filter((i: number) => i !== -1);
        if (selected.length) answers.push({ questionId: q.questionId, selectedOptionIndexes: selected });
      } else {
        let selIndex = typeof ans === 'number' ? ans : q.options.findIndex((opt: any) => opt === ans || opt.value === ans || opt.text === ans);
        if (selIndex >= 0) answers.push({ questionId: q.questionId, selectedOptionIndexes: [selIndex], questionText: q.questionText });
      }
    });
    return { examSubmissionId: this.examId, answers };
  }

  handleSubmit(): void {
    this.saveCurrentAnswer();
    const answered = this.userAnswers.filter(a => a != null).length;

    if (!answered) {
      void Swal.fire({
        title: 'No answers!',
        text: 'Answer at least one question.',
        icon: 'warning'
      });
      return;
    }

    Swal.fire({
      title: 'Submit Exam?',
      text: `Answered ${answered} of ${this.examLength} questions. Submit?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit',
      cancelButtonText: 'No, go back',
    }).then(r => r.isConfirmed && this.submitExam());
  }
async retryPendingSnapshotsBeforeSubmit(): Promise<void> {

  const saved = localStorage.getItem('pendingSnapshots');

  if (!saved) return;

  const snapshots = JSON.parse(saved);

  for (const snapshot of snapshots) {

    try {

      await this._ProctoringService
        .uploadSnapshot(
          snapshot.image,
          snapshot.examId,
          snapshot.userId
        )
        .toPromise();

    } catch (err) {
      console.error('Failed to upload snapshot before submit', err);
    }
  }

  localStorage.removeItem('pendingSnapshots');
}
  submitExam() {
    if (this.isSubmitted) return;
   this.retryPendingSnapshotsBeforeSubmit();
    this.saveCurrentAnswer();
    this.isSubmitted = true;
    this.isSubmitting = true;
    this.optionsForm.disable();
    clearInterval(this.countdownTimer);
    this.cleanupListeners();
    this.stopCamera();

    const payload = this.buildUserAnswerPayload();
    this.lastSubmitPayload = payload;
    this.submitRetryCount = 0;

    this.attemptSubmit(payload);
  }

  private attemptSubmit(payload: any) {
    this.isSubmitting = true;

    this._ExamService.submitUserAnswers(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.score = res?.data?.score ?? null;
        Swal.fire({
          title: 'Success!',
          html: this.score !== null ? `Exam submitted!<hr/><h3>Correct Answers: ${this.score}</h3>` : 'Exam submitted!',
          icon: 'success',
          allowOutsideClick: false,
          confirmButtonText: 'OK',
        }).then(() => {
          this.exitFullScreen();
          this._Router.navigate(['/pages/home']);
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.handleSubmitError(err, payload);
      },
    });
  }

  private handleSubmitError(err: any, payload: any) {
    const errorMessage = err.error?.message || err.message || 'Failed to submit exam';
    const isNetworkError = !err.status || err.status === 0 || err.status >= 500;

    this.isSubmitted = false;
    this.isSubmitting = false;
    this.optionsForm.enable();
    
    if (isNetworkError) {
      this.exitFullScreen();
      if (this.secondsCount <= 0) {
        // Time is already up — show ONE dialog with OK button acting as close only.
        Swal.fire({
          title: 'Submit Failed',
          text: 'Network error. Please check your connection and retry.',
          icon: 'warning',
          timer: 4000,
          timerProgressBar: true,
          allowOutsideClick: true,
          confirmButtonText: 'OK',
        });
      } else {
        this.startCountdown();
        Swal.fire({
          title: 'Try Submit Again',
          text: 'Network error. Please check your connection and click submit button again.',
          icon: 'warning',
          timer: 4000,
          timerProgressBar: true,
          allowOutsideClick: true,
        });
      }
    } else {
      this.exitFullScreen();
      Swal.fire({
        title: 'Submission Failed!',
        html: `<p>${errorMessage}</p>`,
        icon: 'error',
        allowOutsideClick: false,
        confirmButtonText: 'OK',
      }).then(() => {
        this._Router.navigate(['/pages/home']);
      });
    }
  }

  AutoSubmitExam() { this.submitExam(); }

  detectTabSwitch() {
    this.visibilityChangeHandler = () => {
      if (this.isSubmitted) return;
      if (document.hidden) {
        this.saveCurrentAnswer();
        Swal.fire({
          title: 'Caught!',
          text: 'Switching tabs is not allowed. Exam will be submitted automatically.',
          icon: 'warning',
          allowOutsideClick: false,
          confirmButtonText: 'OK',
        }).then(() => this.AutoSubmitExam());
      }
    };
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
  }

  enterFullScreen() {
    const elem = document.documentElement;
    elem.requestFullscreen?.().catch(err => console.warn(err));
    this.fullscreenChangeHandler = () => {
      if (!this.isSubmitted && !document.fullscreenElement) Swal.fire({
        title: 'Note',
        text: 'Leaving fullscreen not allowed. Tab switch will auto-submit exam.',
        icon: 'info',
        confirmButtonText: 'Ok',
      });
    };
    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
  }
tabSwitchCount: number = 0;
disableShortcuts() {

  this.contextMenuHandler = (e: MouseEvent) =>
    !this.isSubmitted && e.preventDefault();

  this.keydownHandler = (e: KeyboardEvent) => {

    if (this.isSubmitted) return;

    // Reload protection
    if (e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) {
      e.preventDefault();

      this.reloadCount++;

      if (this.reloadCount > 1) {
        this.AutoSubmitExam();
      } else {
        Swal.fire({
          title: 'Warning!',
          text: 'Reloading is not allowed. Reload again → auto-submit.',
          icon: 'warning',
          allowOutsideClick: false,
          confirmButtonText: 'OK'
        });
      }
    }

    // Block shortcuts
    if (
      (e.ctrlKey && ['c', 'v', 'x', 'a', 's'].includes(e.key.toLowerCase())) ||
      e.key === 'F12'
    ) {
      e.preventDefault();
    }

    // Detect Alt+Tab attempt
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();

      Swal.fire({
        title: 'Warning!',
        text: 'Switching tabs/windows is not allowed.',
        icon: 'warning'
      });
    }
  };

  // Detect leaving tab/window
  document.addEventListener('visibilitychange', () => {

    if (document.hidden && !this.isSubmitted) {

      this.tabSwitchCount = (this.tabSwitchCount || 0) + 1;

      if (this.tabSwitchCount >= 2) {
        this.AutoSubmitExam();
      } else {
        Swal.fire({
          title: 'Warning!',
          text: 'Leaving the exam window is prohibited. Next time exam will be submitted automatically.',
          icon: 'warning',
          allowOutsideClick: false
        });
      }
    }
  });


  document.addEventListener('contextmenu', this.contextMenuHandler);
  document.addEventListener('keydown', this.keydownHandler);
}

  startCountdown() {
    this.countdownTimer = setInterval(() => {
      if (this.isSubmitted) { clearInterval(this.countdownTimer); return; }
      this.minutes = Math.floor(this.secondsCount / 60);
      this.remSeconds = this.secondsCount % 60;
      this.hours = Math.floor(this.minutes / 60);
      this.remMinutes = this.minutes % 60;
      if (this.secondsCount > 0) this.secondsCount--; else { clearInterval(this.countdownTimer); this.AutoSubmitExam(); }
    }, 1000);
  }

  exitFullScreen() { document.exitFullscreen?.().catch(err => console.warn(err)); }

  cleanupListeners() {
    document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    document.removeEventListener('contextmenu', this.contextMenuHandler);
    document.removeEventListener('keydown', this.keydownHandler);
  }
}