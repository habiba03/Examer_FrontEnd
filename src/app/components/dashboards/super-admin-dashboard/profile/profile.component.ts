import {AfterViewChecked, AfterViewInit, Component, OnInit} from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";
import {NgClass} from "@angular/common";
import {AuthService} from "../../../../services/auth.service";
import {ProfileService} from "../../../../services/profile.service";


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    NgClass
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{
  activeBtn: string ="changeInfo";
  adminName!:string;
  adminId!:number;

  constructor(private _AuthService:AuthService, private _ProfileService:ProfileService) {
  }

  ngOnInit(){
    this._AuthService.decodeToken()
    this.adminId = this._AuthService.decodedTokenInfo.value.id;

    const url = window.location.href.split("/");
    this.activeBtn = url[url.length -1];

    this._ProfileService.getAdminById(this.adminId).subscribe({
      next:(res)=>{
        this._ProfileService.admin.subscribe(data=>this.adminName = data.adminUserName);

      },
      error:(err)=>{

      }
    })
  }

  setActivity(changeInfo: string) {
    this.activeBtn = changeInfo;
  }

}
