import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from "@angular/router";

@Component({
  selector: 'app-take-exam',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './take-exam.component.html',
  styleUrl: './take-exam.component.scss'
})
export class TakeExamComponent implements OnInit{

  examId:any = '';
  userId:any = '';
  constructor(private _ActivatedRoute:ActivatedRoute) {
  }

  ngOnInit(): void {
    this.examId = this._ActivatedRoute.snapshot.queryParamMap.get("id");
    this.userId = this._ActivatedRoute.snapshot.queryParamMap.get("userId");
    console.log('Exam ID from query params take exam comp:', this.examId);
    console.log('User ID from query params take exam comp:', this.userId);
  }


}
