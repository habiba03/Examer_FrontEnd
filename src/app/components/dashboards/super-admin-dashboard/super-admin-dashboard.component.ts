import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { NgClass, UpperCasePipe } from "@angular/common";
import { AdminNamePipe } from "../../../pipes/admin-name.pipe";

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    NgClass,
    UpperCasePipe,
    AdminNamePipe
  ],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.scss'
})
export class SuperAdminDashboardComponent implements OnInit {
  
  activeSec: string = 'categories';
  adminName: string = 'Super Admin';
  
  // Track expanded sections
  expandedSections: { [key: string]: boolean } = {
    categories: false,
    admins: false,
    questions: false
  };

  constructor(
    private _Router: Router,
    private _AuthService: AuthService
  ) {}

  ngOnInit(): void {
    this._AuthService.decodeToken();
    this.adminName = this._AuthService.decodedTokenInfo.value.sub;
    // console.log("admin name is",this.adminName);
    // console.log("decoded token info",this._AuthService.decodedTokenInfo.value);

    
    
    
    
    // Set initial expanded section based on current route
    this.initializeExpandedSections();
  }

  setActivity(activity: string): void {
    this.activeSec = activity;
  }

  toggleSection(section: string): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  initializeExpandedSections(): void {
    const currentUrl = this._Router.url;
    
    // Expand Categories section
    if (currentUrl.includes('categories') || currentUrl.includes('addCategory')) {
      this.expandedSections['categories'] = true;
      if (currentUrl.includes('categories')) {
        this.activeSec = 'categories';
      } else if (currentUrl.includes('addCategory')) {
        this.activeSec = 'addCategory';
      }
    }
    
    // Expand Admins section
    if (currentUrl.includes('admins') || currentUrl.includes('addAdmin') || currentUrl.includes('deletedAdmins')) {
      this.expandedSections['admins'] = true;
      if (currentUrl.includes('deletedAdmins')) {
        this.activeSec = 'deletedAdmins';
      } else if (currentUrl.includes('addAdmin')) {
        this.activeSec = 'addAdmin';
      } else {
        this.activeSec = 'admins';
      }
    }
    
    // Expand Questions section
    if (currentUrl.includes('aiBot') || currentUrl.includes('uploadQuestions')) {
      this.expandedSections['questions'] = true;
      if (currentUrl.includes('uploadQuestions')) {
        this.activeSec = 'uploadQuestions';
      } else {
        this.activeSec = 'aiBot';
      }
    }

    // Profile
    if (currentUrl.includes('profile')) {
      this.activeSec = 'changeInfo';
    }
  }

  handleLogout(): void {
    this._AuthService.logout().subscribe({
      next: (res) => {

      },
      error: (err) => {

      }
    });
  }
}