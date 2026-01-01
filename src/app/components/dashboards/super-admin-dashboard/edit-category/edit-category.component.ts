import { Component, OnInit} from '@angular/core';
import {SuperAdminService} from "../../../../services/super-admin.service";
import {ActivatedRoute, Router} from "@angular/router";
import {TooltipModule} from "primeng/tooltip";
import {QustionContentPipe} from "../../../../pipes/qustion-content.pipe";
import {FormControl, FormGroup, ReactiveFormsModule, Validators, FormArray} from "@angular/forms";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {IquestionContentData} from "../../../../interfaces/iquestion";
import {TitleCasePipe} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";


@Component({
  selector: 'app-edit-category',
  standalone: true,
  imports: [TooltipModule, QustionContentPipe, ReactiveFormsModule, ToastModule, ConfirmDialogModule, TitleCasePipe, PaginatorModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './edit-category.component.html',
  styleUrl: './edit-category.component.scss'
})
export class EditCategoryComponent implements OnInit{

  questions:IquestionContentData[]=[];
  category!:string|null;
  isLoading:boolean = false;
  questionId!:number;
  questionsFilter = [];
  selectedDifficulty: string | null = 'all';
  allowMultipleCorrectAdd: boolean = false;
  allowMultipleCorrectUpdate: boolean = false;

  addQuestionsForm:FormGroup = new FormGroup({
    questionContent: new FormControl(null, Validators.required),
    difficulty: new FormControl(null, Validators.required),
    questionType: new FormControl('MCQ', Validators.required),
    options: new FormArray([]),
    correctOptionIndexes: new FormArray([]),
    category: new FormControl(null, Validators.required),
  },{validators:this.questionValidator});

  updateQuestionsForm:FormGroup = new FormGroup({
    questionContent: new FormControl(null, Validators.required),
    difficulty: new FormControl(null, Validators.required),
    questionType: new FormControl('MCQ', Validators.required),
    options: new FormArray([]),
    correctOptionIndexes: new FormArray([]),
    category: new FormControl(null, Validators.required),
  },{validators:this.questionValidator});

  protected readonly Number = Number;
  first: number = 0;
  totalPages: number = 0;

  constructor(
    private _SuperAdminService:SuperAdminService, 
    private _ActivatedRoute:ActivatedRoute,
    private _Router:Router,
    private confirmationService: ConfirmationService, 
    private messageService: MessageService
  ) {}

  get addOptions(): FormArray {
    return this.addQuestionsForm.get('options') as FormArray;
  }

  get addCorrectOptionIndexes(): FormArray {
    return this.addQuestionsForm.get('correctOptionIndexes') as FormArray;
  }

  get updateOptions(): FormArray {
    return this.updateQuestionsForm.get('options') as FormArray;
  }

  get updateCorrectOptionIndexes(): FormArray {
    return this.updateQuestionsForm.get('correctOptionIndexes') as FormArray;
  }

  ngOnInit(): void {
    this.isLoading =true;
    this.category = this._ActivatedRoute.snapshot.paramMap.get("category");
    this.addQuestionsForm.controls['category'].setValue(this.category);
    
    // Initialize add form
    this.initializeFormOptions(this.addQuestionsForm, 'MCQ');
    
    // Listen to question type changes
    this.addQuestionsForm.get('questionType')?.valueChanges.subscribe(type => {
      this.initializeFormOptions(this.addQuestionsForm, type);
    });

    this.updateQuestionsForm.get('questionType')?.valueChanges.subscribe(type => {
      this.initializeFormOptions(this.updateQuestionsForm, type);
    });

    this.loadQuestions();
  }

  loadQuestions() {
    this._SuperAdminService.getCategoryQuestions(this.category,this.selectedDifficulty,this.first).subscribe({
      next:(res)=>{
        this.questions = res.data.content;
        this.totalPages = res.data.totalPages;
        this.isLoading = false;
      },
      error:(err)=>{
        this.isLoading = false;
      }
    })
  }

  initializeFormOptions(form: FormGroup, questionType: string) {
    const optionsArray = form.get('options') as FormArray;
    const correctIndexesArray = form.get('correctOptionIndexes') as FormArray;
    
    optionsArray.clear();
    correctIndexesArray.clear();

    if (questionType === 'TF') {
      optionsArray.push(new FormControl('True', Validators.required));
      optionsArray.push(new FormControl('False', Validators.required));
    } else if (questionType === 'MCQ') {
      for (let i = 0; i < 4; i++) {
        optionsArray.push(new FormControl(null, Validators.required));
      }
    }
  }

  addOption(form: FormGroup) {
    const optionsArray = form.get('options') as FormArray;
    if (form.get('questionType')?.value === 'MCQ') {
      optionsArray.push(new FormControl(null, Validators.required));
    }
  }

  removeOption(form: FormGroup, index: number) {
    const optionsArray = form.get('options') as FormArray;
    const correctIndexesArray = form.get('correctOptionIndexes') as FormArray;
    
    if (optionsArray.length > 2) {
      optionsArray.removeAt(index);
      
      // Remove from correct answers if selected
      const correctIndex = correctIndexesArray.controls.findIndex(
        ctrl => ctrl.value === index
      );
      if (correctIndex !== -1) {
        correctIndexesArray.removeAt(correctIndex);
      }
      
      // Update indexes for remaining correct answers
      correctIndexesArray.controls.forEach(ctrl => {
        if (ctrl.value > index) {
          ctrl.setValue(ctrl.value - 1);
        }
      });
    }
  }

  toggleMultipleCorrectAdd(event: any) {
    this.allowMultipleCorrectAdd = event.target.checked;
    if (!this.allowMultipleCorrectAdd) {
      const currentCorrect = this.addCorrectOptionIndexes.controls.map(c => c.value);
      this.addCorrectOptionIndexes.clear();
      if (currentCorrect.length > 0) {
        this.addCorrectOptionIndexes.push(new FormControl(currentCorrect[0]));
      }
    }
  }

  toggleMultipleCorrectUpdate(event: any) {
    this.allowMultipleCorrectUpdate = event.target.checked;
    if (!this.allowMultipleCorrectUpdate) {
      const currentCorrect = this.updateCorrectOptionIndexes.controls.map(c => c.value);
      this.updateCorrectOptionIndexes.clear();
      if (currentCorrect.length > 0) {
        this.updateCorrectOptionIndexes.push(new FormControl(currentCorrect[0]));
      }
    }
  }

  toggleCorrectAnswer(form: FormGroup, index: number, event: any, allowMultiple: boolean = false) {
    const correctIndexesArray = form.get('correctOptionIndexes') as FormArray;
    const questionType = form.get('questionType')?.value;
    
    if (event.target.checked) {
      if (questionType === 'TF' || !allowMultiple) {
        correctIndexesArray.clear();
      }
      correctIndexesArray.push(new FormControl(index));
    } else {
      const correctIndex = correctIndexesArray.controls.findIndex(
        ctrl => ctrl.value === index
      );
      if (correctIndex !== -1) {
        correctIndexesArray.removeAt(correctIndex);
      }
    }
  }

  isCorrectAnswer(form: FormGroup, index: number): boolean {
    const correctIndexesArray = form.get('correctOptionIndexes') as FormArray;
    return correctIndexesArray.controls.some(ctrl => ctrl.value === index);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.isLoading = true;
    this.loadQuestions();
  }

  filterByDifficulty(difficulty: string | null) {
    this.selectedDifficulty = difficulty;
    this.isLoading = true;
    this.first = 0;
    this.loadQuestions();
  }

  questionValidator(form: any) {
    const questionType = form.get('questionType')?.value;
    const options = form.get('options') as FormArray;
    const correctOptionIndexes = form.get('correctOptionIndexes') as FormArray;

    if (questionType === 'WRITTEN') {
      return null;
    }

    if (correctOptionIndexes.length === 0) {
      return { noCorrectAnswer: 'At least one correct answer must be selected' };
    }

    const optionValues = options.controls.map(ctrl => ctrl.value?.trim()).filter(v => v);
    const uniqueValues = new Set(optionValues);
    if (optionValues.length !== uniqueValues.size) {
      return { duplicateOptions: 'All options must be unique' };
    }

    return null;
  }

  handleAddQuestion(addQuestionsForm: FormGroup) {
    this.isLoading = true;
    const formValue = this.prepareFormData(addQuestionsForm);
    
    this._SuperAdminService.addQuestion(formValue,this.selectedDifficulty,this.first).subscribe({
      next:(res)=>{
        this.questions = res.data.content;
        this.totalPages = res.data.totalPages;
        this.messageService.add({ severity: 'success', summary: 'Success', key:'bc', detail: res.message });
        this.isLoading = false;
        this.resetForm(addQuestionsForm);
      },
      error:(err)=>{
        this.messageService.add({ severity: 'error', summary: 'Error',key:'bc', detail: err.error.message });
        this.isLoading = false;
      }
    })
  }

  handleGetQuestion(id:number) {
    this._SuperAdminService.getQuestion(id).subscribe({
      next:(res)=>{
        this.questionId = res.data.questionId;
        const data = res.data;
        
        this.updateQuestionsForm.get("questionContent")?.setValue(data.questionContent);
        this.updateQuestionsForm.get("difficulty")?.setValue(data.difficulty);
        this.updateQuestionsForm.get("questionType")?.setValue(data.questionType);
        this.updateQuestionsForm.get("category")?.setValue(data.category);
        
        // Determine if multiple correct answers
        this.allowMultipleCorrectUpdate = data.correctOptionIndexes.length > 1;
        
        // Clear and populate options
        this.updateOptions.clear();
        data.options.forEach((option: string) => {
          this.updateOptions.push(new FormControl(option, Validators.required));
        });
        
        // Clear and populate correct indexes
        this.updateCorrectOptionIndexes.clear();
        data.correctOptionIndexes.forEach((index: number) => {
          this.updateCorrectOptionIndexes.push(new FormControl(index));
        });
      },
      error:(err)=>{
        this.messageService.add({ severity: 'error', summary: 'Error',key:'bc', detail: 'Failed to load question' });
      }
    })
  }

  handleUpdateQuestion(updateQuestionsForm: FormGroup) {
    this.isLoading = true;
    const formValue = this.prepareFormData(updateQuestionsForm);
    
    this._SuperAdminService.updateQuestion(formValue,this.questionId,this.selectedDifficulty,this.first).subscribe({
      next:(res)=>{
        this.questions = res.data.content;
        this.totalPages = res.data.totalPages;
        this.messageService.add({ severity: 'success', summary: 'Success', key:'bc', detail: res.message });
        this.isLoading = false;
      },
      error:(err)=>{
        this.messageService.add({ severity: 'error', summary: 'Error',key:'bc', detail: err.error.message });
        this.isLoading = false;
      }
    })
  }

  handleDleteQuestion(event: Event,questionId: number) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      accept: () => {
        this.isLoading = true;
        this._SuperAdminService.deleteQuestion(questionId,this.selectedDifficulty,this.first).subscribe({
          next:(res)=>{
            this.questions = res.data.content;
            this.totalPages = res.data.totalPages;
            this.messageService.add({ severity: 'info', summary: 'Confirmed',key:'bc', detail: 'Record deleted' });
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

  private prepareFormData(form: FormGroup): any {
    const questionType = form.get('questionType')?.value;
    const optionsArray = form.get('options') as FormArray;
    const correctIndexesArray = form.get('correctOptionIndexes') as FormArray;
    
    return {
      questionContent: form.get('questionContent')?.value,
      category: form.get('category')?.value,
      difficulty: form.get('difficulty')?.value,
      questionType: questionType,
      options: questionType === 'WRITTEN' ? [] : optionsArray.controls.map(ctrl => ctrl.value),
      correctOptionIndexes: correctIndexesArray.controls.map(ctrl => ctrl.value)
    };
  }

  private resetForm(form: FormGroup) {
    const questionType = form.get('questionType')?.value;
    const category = form.get('category')?.value;
    
    form.reset();
    form.get('questionType')?.setValue(questionType || 'MCQ');
    form.get('category')?.setValue(category);
    
    if (form === this.addQuestionsForm) {
      this.allowMultipleCorrectAdd = false;
    } else {
      this.allowMultipleCorrectUpdate = false;
    }
    
    this.initializeFormOptions(form, questionType || 'MCQ');
  }

  getCorrectAnswersDisplay(question: IquestionContentData): string {
    return question.correctOptionIndexes
      .map(index => question.options[index])
      .join(', ');
  }
}