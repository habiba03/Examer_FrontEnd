import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { TooltipModule } from 'primeng/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TitleCasePipe } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { QustionContentPipe } from '../../../../pipes/qustion-content.pipe';
import { ConfirmationService, MessageService } from 'primeng/api';
import {SuperAdminService} from "../../../../services/super-admin.service";
import {TableModule} from "primeng/table";

@Component({
  selector: 'app-generated-question',
  standalone: true,
  imports: [
    CommonModule, // Add CommonModule for structural directives like *ngIf
    TooltipModule,
    QustionContentPipe,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    TitleCasePipe,
    PaginatorModule,
    TableModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './generated-question.component.html',
  styleUrls: ['./generated-question.component.scss']
})
export class GeneratedQuestionComponent implements OnInit {
  questions: any[] = [];
  categoryName:string ='';
  isLoading = false;

  constructor(private _Router:Router, private _SuperAdminService:SuperAdminService) {}

  ngOnInit(): void {
    this.isLoading = true;

    // Retrieve questions from router state
    const stateData = history.state?.questions;
    if (stateData) {
      this.questions = stateData;
      this.categoryName = this.questions[0].category;
      this.isLoading = false;
    } else {
      console.error('No questions data passed through the router.');
      this.isLoading = false;
    }
  }

  selectedQuestions:any[] = [];

  handleAddQuestions() {
    this._SuperAdminService.addCategory(this.selectedQuestions).subscribe({
      next:(res)=>{
        this._Router.navigate(['/dashboard/superAdmin/aiBot']);

      },
      error:(err)=>{

      }
    })
  }
}
