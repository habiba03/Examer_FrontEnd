import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {FormGroup} from "@angular/forms";
import {Iexam} from "../interfaces/iexam";
import {Iuser} from "../interfaces/iuser";
import {Iscore} from "../interfaces/iscore";
import {Icategory, IcategoryTitle} from "../interfaces/icategory";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private _HttpClient:HttpClient) { }


  getAllCategoriesTitle():Observable<IcategoryTitle>{
    return this._HttpClient.get<IcategoryTitle>('/api/v1/getCategoriesTitle');
  }

  getCategoryDetails(categoryName:string):Observable<any>{
    return this._HttpClient.get<any>(`/api/v1/getCategoryDetails/${categoryName}`);
  }

  addExam(data:FormGroup):Observable<Icategory>{
    return this._HttpClient.post<Icategory>("/api/v1/addExam",data);
  }

  getAdminExams(id:number,pageNumber:number):Observable<any>{
    return this._HttpClient.get(`/api/v1/getAllExamsByAdminId/${id}`,{params:{page:pageNumber}});
  }
  getAdminExamsList(id:number):Observable<any>{
    return this._HttpClient.get(`/api/v1/getAllExamsList/${id}`);
  }

  getUsersForAdminExam(examId:number,adminId:number,pageNumber:number):Observable<Iscore>{
    return this._HttpClient.get<Iscore>(`/api/v1/getUsersForExamAndAdmin/${examId}/${adminId}`,{params:{page:pageNumber}});
  }

  resetUserExam(userData:any):Observable<any>{
    return this._HttpClient.put("/api/v1/resetUserExam",userData);
  }

  addUser(data:FormGroup):Observable<any>{
    return this._HttpClient.post("/api/v1/addUser",data);
  }

  getAllExams(id:number,pageNumber:number):Observable<Iexam>{
    return this._HttpClient.get<Iexam>(`/api/v1/getAllExamsByAdminId/${id}`,{params:{page:pageNumber}})
  }

  deleteExam(id:number):Observable<any>{
    return this._HttpClient.delete<any>(`/api/v1/deleteExamById/${id}`)
  }


  getAllUsers(id:number,pageNumber:number):Observable<Iuser>{
    return this._HttpClient.get<Iuser>(`/api/v1/usersOfAdmin/${id}`,{params:{page:pageNumber}});
  }

  deleteUser(id:number,pageNumber:number):Observable<any>{
    return this._HttpClient.put(`/api/v1/deleteUser`,{userId:id},{params:{page:pageNumber}});
  }

  updateUser(data:FormGroup,id:number,pageNumber:number):Observable<any>{
    return this._HttpClient.put(`/api/v1/updateUser/${id}`,data,{params:{page:pageNumber}});
  }

  getuser(id:number):Observable<any>{
    return this._HttpClient.get(`/api/v1/getUser/${id}`)
  }

  getAdminUsersAndNotAssigned(examId:number, admind:number):Observable<any>{
    return this._HttpClient.get(`/api/v1/usersOfAdminAndNotAssigned/${examId}/${admind}`)
  }

  assignUsertoExam(data:any,pageNumber:number):Observable<any>{
    return this._HttpClient.post('/api/v1/assign',data,{params:{page:pageNumber}});
  }

  usersOfAdminAndStatus(examId:number, adminId:number,pageNumber:number):Observable<any>{
    return this._HttpClient.get(`/api/v1/usersOfAdminAndStatus/${examId}/${adminId}`,{params:{page:pageNumber}});
  }

  getDeletedUsers(adminId:number,pageNumber:number):Observable<any>{
    return this._HttpClient.get(`/api/v1/getDeletedUsersByAdminId/${adminId}`,{params:{page:pageNumber}});
  }

  hardDeleteUser(userId:number,pageNumber:number):Observable<any> {
    return this._HttpClient.delete(`/api/v1/hardDeleteByUserId/${userId}`,{params:{page:pageNumber}});
  }

  restoreDeletedUser(data:any,pageNumber:number):Observable<any>{
      return this._HttpClient.put("/api/v1/recoverUser",data,{params:{page:pageNumber}});
  }

}
