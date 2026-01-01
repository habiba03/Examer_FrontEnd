import {Component, OnInit} from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";
import {NgClass, UpperCasePipe} from "@angular/common";
import {AuthService} from "../../../services/auth.service";
import {AdminNamePipe} from "../../../pipes/admin-name.pipe";
import {ProfileService} from "../../../services/profile.service";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    NgClass,
    AdminNamePipe,
    UpperCasePipe
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit{

  activeSec: string = "categories";
  adminName!:string;
  adminId!:number;

  constructor(private _AuthService:AuthService, private _ProfileService:ProfileService) {
  }

  ngOnInit() {
    this._AuthService.decodeToken()
    this.adminId = this._AuthService.decodedTokenInfo.value.id;
    const url = window.location.href.split("/");
    this.activeSec = url[url.length -1];
    this._ProfileService.getAdminById(this.adminId).subscribe({
      next:(res)=>{
        this._ProfileService.admin.next(res.data);
        this._ProfileService.admin.subscribe(data=>this.adminName = data.adminUserName);

      },
      error:(err)=>{
      }
    })
  }

  setActivity(secName: string) {
    this.activeSec = secName;
  }

  handleLogOut(){
    this._AuthService.logout().subscribe({
      next:(res)=>{

      },
      error:(err)=>{

      }
    });
  }
}
