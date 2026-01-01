import {Component, OnInit} from '@angular/core';
import {DropdownModule} from "primeng/dropdown";
import {MessageService, PrimeTemplate} from "primeng/api";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ToastModule} from "primeng/toast";
import {AdminService} from "../../../../services/admin.service";
import {AuthService} from "../../../../services/auth.service";
import {SuperAdminService} from "../../../../services/super-admin.service";
import {Route, Router} from "@angular/router";

@Component({
  selector: 'app-ai-bot',
  standalone: true,
  imports: [
    DropdownModule,
    PrimeTemplate,
    ReactiveFormsModule,
    ToastModule, FormsModule
  ],
  providers:[MessageService],
  templateUrl: './ai-bot.component.html',
  styleUrl: './ai-bot.component.scss'
})
export class AiBotComponent{

  categories: string[]=[];
  isLoading:boolean = false;

  newQuestion: FormGroup = new FormGroup({
    questionTitle: new FormControl(null, [Validators.required]),
    questionTopic: new FormControl(null, [Validators.required]),
    easyQuestion: new FormControl(null, [Validators.required,Validators.min(0),Validators.max(10),Validators.pattern(/^\d+$/)]),
    mediumQuestion: new FormControl(null, [Validators.required,Validators.min(0),Validators.max(10),Validators.pattern(/^\d+$/)]),
    hardQuestion: new FormControl(null, [Validators.required,Validators.min(0),Validators.max(10),Validators.pattern(/^\d+$/)]),
  });

  constructor(private _SuperAdminService:SuperAdminService, private messageService:MessageService,private router:Router) {
  }


  handleAiBot(newQuestion: FormGroup) {
    this.isLoading = true;

    // Extract raw form values
    const requestData = newQuestion.value;

    this._SuperAdminService.generateQuestion(requestData).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.data) {
          this.router.navigate(['/dashboard/superAdmin/generatedQuestions'], {
            state: { questions: res.data },
          });
        } else {
          console.error('No data returned from the API.');
        }
        this.messageService.add({severity:'success', summary:'Success',detail:res.message,key:'bc'})
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({severity:'error', summary:'Error',detail:err.error.message,key:'bc'})
        console.error('Error generating questions:', err);
      },
    });
  }

}
