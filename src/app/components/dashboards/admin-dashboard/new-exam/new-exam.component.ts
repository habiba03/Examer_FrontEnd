import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {AdminService} from "../../../../services/admin.service";
import {AuthService} from "../../../../services/auth.service";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import { IcategoryTitle} from "../../../../interfaces/icategory";

@Component({
  selector: 'app-new-exam',
  standalone: true,
  imports: [ReactiveFormsModule, DropdownModule, FormsModule,ToastModule],
  providers:[MessageService],
  templateUrl: './new-exam.component.html',
  styleUrl: './new-exam.component.scss'
})
export class NewExamComponent implements OnInit{

  categories: string[]=[];
  categoriesName:any[] = [];
  isLoading:boolean = false;
  // num_totalQuestions:number = 0;
  num_easy:number = 0;
  num_medium:number = 0;
  num_hard:number = 0;

  newExam: FormGroup = new FormGroup({
    categoryName: new FormControl(null, Validators.required),
    examTitle: new FormControl(null, Validators.required),
    // NumberOfQuestions: new FormControl(null, [Validators.required,Validators.min(1)]),
    examDuration: new FormControl(null, [Validators.required, Validators.min(1),Validators.pattern(/^\d+$/)]),
    easy: new FormControl(null, [Validators.required,Validators.min(0),Validators.pattern(/^\d+$/)]),
    medium: new FormControl(null, [Validators.required,Validators.min(0),Validators.pattern(/^\d+$/)]),
    hard: new FormControl(null, [Validators.required,Validators.min(0),Validators.pattern(/^\d+$/)]),
    examDescription: new FormControl(null, Validators.required),
    adminId: new FormControl(null, Validators.required),
  });

  constructor(private _AdminService:AdminService, private _AuthService:AuthService, private messageService:MessageService) {
  }

  ngOnInit() {
    this._AuthService.decodeToken();
    let adminId = this._AuthService.decodedTokenInfo.value.id;
    this.newExam.get("adminId")?.setValue(adminId);
    this._AdminService.getAllCategoriesTitle().subscribe({
      next:(res)=>{
        this.categories = res.data;
        for(let category of this.categories){
          let categoryName = { name : category};
          this.categoriesName.push(categoryName);
        }

      },
      error:(err)=>{

      }
    });

  }

  handleDropDown(event: any) {
    this._AdminService.getCategoryDetails(event.value.name).subscribe({
      next:(res)=>{
        this.num_easy = res.data.num_easy;
        this.num_medium = res.data.num_medium;
        this.num_hard = res.data.num_hard;

        this.newExam.get('easy')?.setValidators([
          Validators.max(this.num_easy),
          Validators.min(0)
        ]);
        this.newExam.get('medium')?.setValidators([
          Validators.max(this.num_medium),
          Validators.min(0)
        ]);
        this.newExam.get('hard')?.setValidators([
          Validators.max(this.num_hard),
          Validators.min(0)
        ]);
        // this.newExam.get('NumberOfQuestions')?.updateValueAndValidity();

      },error:(err)=>{

      }
    })
  }


  handleAddExam(newExam: FormGroup) {
    this.isLoading = true;
    const selectedExamTitle = newExam.get("examTitle")?.value;
    const easy = newExam.get("easy")?.value;
    const medium = newExam.get("medium")?.value;
    const hard = newExam.get("hard")?.value;
    const examDuration = newExam.get("examDuration")?.value;
    if (selectedExamTitle && selectedExamTitle.name) {
      this.newExam.patchValue({
        examTitle: selectedExamTitle.name,
        easy:Number(easy),
        medium:Number(medium),
        hard:Number(hard),
        examDuration:Number(examDuration),
      });
    }

    this._AdminService.addExam(newExam.value).subscribe({
      next:(res)=>{
        this.isLoading = false;
        this.messageService.add({severity:'success',summary:'Success',detail:res.message,key:'bc'})

      },
      error:(err)=>{
        this.isLoading = false;
        this.messageService.add({severity:'error',summary:'Error', detail:err.error.message, key:'bc'})

      }
    })
  }
}
