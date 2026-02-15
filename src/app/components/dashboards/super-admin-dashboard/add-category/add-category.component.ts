import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { SuperAdminService } from '../../../../services/super-admin.service'; // Adjust path as needed

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.scss'
})
export class AddCategoryComponent {

  isLoading: boolean = false;


  private _Router = inject(Router);


  addCategoryForm: FormGroup = new FormGroup({
    category: new FormControl(null, [Validators.required, Validators.pattern(/^(?!\s*$)[a-zA-Z0-9_ ]{2,30}$/)]),
  });

  handleGenerate(addCategoryForm: FormGroup) {
    this._Router.navigate([`/dashboard/superAdmin/addQuestions/${addCategoryForm.value.category}`]);
  }




  
}