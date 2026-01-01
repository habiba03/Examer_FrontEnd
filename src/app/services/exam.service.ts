import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { UserAnswerPayload } from "../interfaces/iuserAnswer";



@Injectable({
  providedIn: 'root'
})
export class ExamService {

  constructor(private _HttpClient:HttpClient) { }

  getExamQuestions(examId:string):Observable<any>{
    return this._HttpClient.get(`/api/v1/examQuestions`,{params:{id:examId}});
  }

  submitUserAnswers(payload: UserAnswerPayload): Observable<any> {
    return this._HttpClient.post(`/api/v1/user-answers`, payload);
  }

  updateUserScore(examId:string, data:any):Observable<any>{
    return this._HttpClient.put(`/api/v1/assignupdate`,data,{params:{id:examId}});
  }
}
