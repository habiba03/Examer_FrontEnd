import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators, FormArray} from "@angular/forms";
import {IquestionContentData} from "../../../../interfaces/iquestion";
import {BehaviorSubject} from "rxjs";
import {SuperAdminService} from "../../../../services/super-admin.service";
import {NgClass, NgForOf} from "@angular/common";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-add-questions',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgForOf,
    ToastModule,
    NgClass
  ],
  providers: [MessageService],
  templateUrl: './add-questions.component.html',
  styleUrl: './add-questions.component.scss'
})
export class AddQuestionsComponent implements OnInit{

  category:BehaviorSubject<any> = new BehaviorSubject('');
  allowMultipleCorrect: boolean = false;
  isLoading: boolean = false;
  addQuestionsForm:FormGroup = new FormGroup({
    questionContent: new FormControl(null, Validators.required),
    difficulty: new FormControl(null, Validators.required),
    questionType: new FormControl('MCQ', Validators.required),
    options: new FormArray([]),
    correctOptionIndexes: new FormArray([]),
    category: new FormControl(null, Validators.required),
  },{validators:this.questionValidator});
  
  protected readonly Number = Number;
  questions:IquestionContentData[] = [];

  constructor(private _ActivatedRoute:ActivatedRoute, private _SuperAdminService:SuperAdminService, private _Router:Router, private messageService: MessageService) {
  }

  get options(): FormArray {
    return this.addQuestionsForm.get('options') as FormArray;
  }

  get correctOptionIndexes(): FormArray {
    return this.addQuestionsForm.get('correctOptionIndexes') as FormArray;
  }

  ngOnInit() {
    // Get category from route
    const categoryValue = this._ActivatedRoute.snapshot.paramMap.get("category");
    this.category.next(categoryValue);
    this.addQuestionsForm.controls['category'].setValue(categoryValue);

    // Initialize with MCQ options (default)
    this.initializeOptions('MCQ');

    // Listen to question type changes
    this.addQuestionsForm.get('questionType')?.valueChanges.subscribe(type => {
      this.initializeOptions(type);
    });
  }

  initializeOptions(questionType: string) {
    // Clear existing options and correct answers
    this.options.clear();
    this.correctOptionIndexes.clear();

    if (questionType === 'TF') {
      // True/False: 2 options
      this.options.push(new FormControl('True', Validators.required));
      this.options.push(new FormControl('False', Validators.required));
    } else if (questionType === 'MCQ') {
      // MCQ: 4 options
      for (let i = 0; i < 4; i++) {
        this.options.push(new FormControl(null, Validators.required));
      }
    } else if (questionType === 'WRITTEN') {
      // Written: no options needed
      this.options.clear();
    }
  }

  addOption() {
    if (this.addQuestionsForm.get('questionType')?.value === 'MCQ') {
      this.options.push(new FormControl(null, Validators.required));
    }
  }

  removeOption(index: number) {
    if (this.options.length > 2) {
      this.options.removeAt(index);
      // Remove from correct answers if selected
      const correctIndex = this.correctOptionIndexes.controls.findIndex(
        ctrl => ctrl.value === index
      );
      if (correctIndex !== -1) {
        this.correctOptionIndexes.removeAt(correctIndex);
      }
      // Update indexes for remaining correct answers
      this.correctOptionIndexes.controls.forEach(ctrl => {
        if (ctrl.value > index) {
          ctrl.setValue(ctrl.value - 1);
        }
      });
    }
  }

  toggleMultipleCorrect(event: any) {
    this.allowMultipleCorrect = event.target.checked;
    if (!this.allowMultipleCorrect) {
      // If switching to single answer, keep only the first selected answer
      const currentCorrect = this.correctOptionIndexes.controls.map(c => c.value);
      this.correctOptionIndexes.clear();
      if (currentCorrect.length > 0) {
        this.correctOptionIndexes.push(new FormControl(currentCorrect[0]));
      }
    }
  }

  toggleCorrectAnswer(index: number, event: any) {
    const questionType = this.addQuestionsForm.get('questionType')?.value;
    
    if (event.target.checked) {
      // For TF or single-answer MCQ, only allow one correct answer
      if (questionType === 'TF' || !this.allowMultipleCorrect) {
        this.correctOptionIndexes.clear();
      }
      this.correctOptionIndexes.push(new FormControl(index));
    } else {
      const correctIndex = this.correctOptionIndexes.controls.findIndex(
        ctrl => ctrl.value === index
      );
      if (correctIndex !== -1) {
        this.correctOptionIndexes.removeAt(correctIndex);
      }
    }
  }

  isCorrectAnswer(index: number): boolean {
    return this.correctOptionIndexes.controls.some(ctrl => ctrl.value === index);
  }

  questionValidator(form: any) {
    const questionType = form.get('questionType')?.value;
    const options = form.get('options') as FormArray;
    const correctOptionIndexes = form.get('correctOptionIndexes') as FormArray;

    // Skip validation for WRITTEN type
    if (questionType === 'WRITTEN') {
      return null;
    }

    // Check if at least one correct answer is selected
    if (correctOptionIndexes.length === 0) {
      return { noCorrectAnswer: 'At least one correct answer must be selected' };
    }

    // Check for duplicate options
    const optionValues = options.controls.map(ctrl => ctrl.value?.trim()).filter(v => v);
    const uniqueValues = new Set(optionValues);
    if (optionValues.length !== uniqueValues.size) {
      return { duplicateOptions: 'All options must be unique' };
    }

    return null;
  }

  handleAddQuestion(addQuestionsForm: FormGroup) {
    const formValue = this.prepareFormData(addQuestionsForm);
    this.questions.push(formValue);
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Success', 
      key: 'bc', 
      detail: 'Question added to list. Click "Save All Questions" when done.' 
    });
    this.resetForm();
  }

  removeQuestion(index: number) {
    this.questions.splice(index, 1);
    this.messageService.add({ 
      severity: 'info', 
      summary: 'Removed', 
      key: 'bc', 
      detail: 'Question removed from list.' 
    });
  }

  handleCancel() {
    if (this.questions.length > 0) {
      const confirmed = confirm('You have unsaved questions. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    this._Router.navigate(['/dashboard/superAdmin/addCategory']);
  }

  handleAddQuestionSubmition(addQuestionsForm: FormGroup) {
    // Add current question to the list if form is valid
    if (addQuestionsForm.valid) {
      const formValue = this.prepareFormData(addQuestionsForm);
      this.questions.push(formValue);
    }
    
    // Check if there are any questions to submit
    if (this.questions.length === 0) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        key: 'bc', 
        detail: 'Please add at least one question before saving.' 
      });
      return;
    }
    
    this.isLoading = true;
    
    // Prepare data for the backend
    const questionsToSubmit = this.questions.map(q => {
      const questionData: any = {
        questionContent: q.questionContent,
        category: q.category,
        difficulty: q.difficulty,
        questionType: q.questionType,
        options: q.options || [],
        correctOptionIndexes: q.correctOptionIndexes || []
      };
      
      return questionData;
    });
    
    console.log('Submitting questions:', questionsToSubmit);
    
    this._SuperAdminService.addCategory(questionsToSubmit).subscribe({
      next:(res)=>{
        console.log('Success response:', res);
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Success', 
          key: 'bc', 
          detail: `${this.questions.length} question(s) saved successfully!` 
        });
        this.isLoading = false;
        setTimeout(() => {
          this._Router.navigate(['/dashboard/superAdmin/addCategory']);
        }, 1500);
      },
      error:(err)=>{
        console.error('Error response:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message
        });
        
        let errorMessage = 'Failed to save questions. Please try again.';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your connection.';
        } else if (err.status === 400) {
          errorMessage = 'Invalid data format. Please check your questions.';
        } else if (err.status === 401 || err.status === 403) {
          errorMessage = 'You are not authorized to perform this action.';
        } else if (err.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          key: 'bc', 
          detail: errorMessage
        });
        this.isLoading = false;
      }
    })
  }

  private prepareFormData(form: FormGroup): IquestionContentData {
    const questionType = form.get('questionType')?.value;
    
    return {
      questionId: 0, // Will be assigned by backend
      questionContent: form.get('questionContent')?.value,
      category: form.get('category')?.value,
      difficulty: form.get('difficulty')?.value,
      questionType: questionType,
      options: questionType === 'WRITTEN' ? [] : this.options.controls.map(ctrl => ctrl.value),
      correctOptionIndexes: questionType === 'WRITTEN' ? [] : this.correctOptionIndexes.controls.map(ctrl => ctrl.value)
    };
  }

  private resetForm() {
    const questionType = this.addQuestionsForm.get('questionType')?.value;
    const category = this.addQuestionsForm.get('category')?.value;
    
    this.addQuestionsForm.reset();
    this.addQuestionsForm.get('questionType')?.setValue(questionType);
    this.addQuestionsForm.get('category')?.setValue(category);
    this.allowMultipleCorrect = false;
    this.initializeOptions(questionType);
  }
}