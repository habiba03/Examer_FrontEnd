import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Iquestion, IquestionContentData} from "../interfaces/iquestion";
import {FormGroup} from "@angular/forms";
import {Iadmin} from "../interfaces/iadmin";
import {Icategory} from "../interfaces/icategory";

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {

  constructor(private _HttpClient:HttpClient) { }

  addCategory(data:IquestionContentData[]):Observable<any>{
    return this._HttpClient.post("/api/v1/addQuestionList", data);
  }

  getAllCategories(pageNumber:number):Observable<Icategory>{
    return this._HttpClient.get<Icategory>("/api/v1/getAvailableCategories",{params:{page:pageNumber}});
  }

  addAdmin(data:FormGroup):Observable<any>{
    return this._HttpClient.post("/api/v1/addAdmin",data);
  }

  getAllAdmins(pageNumber:number):Observable<Iadmin>{
    return this._HttpClient.get<Iadmin>('/api/v1/getAdminsByRole/admin',{params:{page:pageNumber}});
  }

  getCategoryQuestions(category:string|null,difficulty:string|null,pageNumber:number):Observable<Iquestion>{
    return this._HttpClient.get<Iquestion>(`/api/v1/getAllQuestionsByCategory/${category}/${difficulty}`,{params:{page:pageNumber}});
  }

  addQuestion(data:FormGroup,difficulty:string|null,pageNumber:number):Observable<any>{
    return this._HttpClient.post(`/api/v1/addQuestion/${difficulty}`, data,{params:{page:pageNumber}});
  }

  getQuestion(id:number):Observable<any>{
    return this._HttpClient.get(`/api/v1/getQuestionById/${id}`)
  }

  updateQuestion(data:FormGroup,id:number,difficulty:string|null,pageNumber:number):Observable<any>{
    return this._HttpClient.put(`/api/v1/updateQuestionById/${id}/${difficulty}`,data,{params:{page:pageNumber}});
  }

  deleteQuestion(id:number,difficulty:string|null,pageNumber:number):Observable<any>{
    return this._HttpClient.delete(`/api/v1/deleteQuestionById/${id}/${difficulty}`,{params:{page:pageNumber}});
  }

  deleteAdmin(id:number,pageNumber:number):Observable<any>{
    return this._HttpClient.put(`/api/v1/deleteAdminById`,{adminId:id},{params:{page:pageNumber}});
  }

  getDeletedAdmin(pageNumber:number):Observable<any>{
    return this._HttpClient.get("/api/v1/getDeletedAdmins/admin",{params:{page:pageNumber}})
  }

  hardDeleteAdmin(adminId:number,pageNumber:number):Observable<any>{
    return this._HttpClient.delete(`/api/v1/hardDeleteAdmin/${adminId}`,{params:{page:pageNumber}})
  }

  restoreAdmin(data:any,pageNumber:number):Observable<any>{
    return this._HttpClient.put("/api/v1/recoverAdmin",data,{params:{page:pageNumber}})
  }

  generateQuestion(data: any): Observable<any> {
    return this._HttpClient.post<any>("/api/v1/prompt", data);
  }


}
