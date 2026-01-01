import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {FormGroup} from "@angular/forms";
import {IadminData} from "../interfaces/iadmin";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class ProfileService implements OnInit{

  admin:BehaviorSubject<IadminData> = new BehaviorSubject({"adminId":0,"adminUserName":"","email":"","phone":0});
  adminId!:number;

  constructor(private _HttpClient:HttpClient,private _AuthService:AuthService) { }

  ngOnInit(){
    this._AuthService.decodeToken()
    this.adminId = this._AuthService.decodedTokenInfo.value.id;
    this.getAdminById(this.adminId).subscribe({
      next:(res)=>{
        this.admin.next(res.data);

      },
      error:(err)=>{

      }
    })
  }

  changeInfo(data:FormGroup,id:number):Observable<any>{
    return this._HttpClient.put(`/api/v1/updateAdminInfoById/${id}`, data);
  }

  changePassword(data:any,id:number):Observable<any>{
    return this._HttpClient.put(`/api/v1/updateAdminPasswordById/${id}`, data);
  }

  getAdminById(id:number):Observable<any>{
    return this._HttpClient.get(`/api/v1/getAdminById/${id}`);
  }



}
