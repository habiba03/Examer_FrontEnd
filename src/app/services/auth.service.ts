import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {FormGroup} from "@angular/forms";
import {Ilogin} from "../interfaces/ilogin";
import { jwtDecode } from 'jwt-decode';
import {Router} from "@angular/router";
import {secureLocalStorage} from "../secureLocalStorage/secure-storage-util";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  decodedTokenInfo:any = new BehaviorSubject(null);

  constructor(private _HttpClient:HttpClient, private _Router:Router) { }

  login(data:FormGroup):Observable<Ilogin>{
    return this._HttpClient.post<Ilogin>("/api/v1/login", data);
  }

  decodeToken(){
    let encodedToken = JSON.stringify(secureLocalStorage.getItem("token"));
    let decodedToken = jwtDecode(encodedToken);
    this.decodedTokenInfo.next(decodedToken);
  }

  logout():Observable<any>{
    let encodedToken= secureLocalStorage.getItem("token");
    secureLocalStorage.removeItem("token");
    this.decodedTokenInfo.next(null);
    this._Router.navigate(['/pages/login']);
    return this._HttpClient.post("/api/v1/logoutAdmin",{token:encodedToken});
  }

  forgetPassword(data:any):Observable<any>{
    return this._HttpClient.post("/api/v1/forgotPassword",data);
  }
  resetPasswordCheckOtp(data:any):Observable<any>{
    return this._HttpClient.post("/api/v1/resetPasswordCheckOtp",data);
  }
  resetPasswordUpdate(data:FormGroup):Observable<any>{
    return this._HttpClient.put("/api/v1/resetPasswordUpdate",data);
  }
}
