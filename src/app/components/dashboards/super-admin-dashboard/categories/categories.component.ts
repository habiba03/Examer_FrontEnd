import {Component, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {SuperAdminService} from "../../../../services/super-admin.service";
import {IcategoryContentData} from "../../../../interfaces/icategory";
import {SkeletonModule} from "primeng/skeleton";
import {NgForOf} from "@angular/common";
import {PaginatorModule} from "primeng/paginator";


@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    RouterLink,
    SkeletonModule,
    NgForOf,
    PaginatorModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit{

  categories:IcategoryContentData[]=[];
  isLoading:boolean=true;
  constructor(private _SuperAdminService:SuperAdminService) {
  }

  first: number = 0;
  totalPages: number = 0;

  onPageChange(event: any) {
    this.first = event.first;
    this.isLoading = true;
    this._SuperAdminService.getAllCategories(this.first).subscribe({
      next:(res)=>{
        this.categories = res.data.content;
        this.totalPages = res.data.totalPages;
        this.isLoading =false;

      },
      error:(err)=>{
        this.isLoading =false;

      }
    })
  }

  ngOnInit(): void {
  this._SuperAdminService.getAllCategories(this.first).subscribe({
    next:(res)=>{
      this.categories = res.data.content;
      this.totalPages = res.data.totalPages;
      this.isLoading = false;

    },
    error:(err)=>{

    }
  })
  }

}
