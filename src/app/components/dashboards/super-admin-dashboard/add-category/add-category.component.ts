import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.scss'
})
export class AddCategoryComponent {

  isLoading:boolean = false;

  addCategoryForm:FormGroup = new FormGroup({
    category: new FormControl(null, Validators.required),
    // NOQ: new FormControl(null, [Validators.required, Validators.pattern(/^[1-9][0-9]*$/)]),
  })

  constructor(private _Router:Router) {
  }

  handleGenerate(addCategoryForm: FormGroup) {
    this._Router.navigate([`/dashboard/superAdmin/addQuestions/${addCategoryForm.value.category}`]);
  }
}
