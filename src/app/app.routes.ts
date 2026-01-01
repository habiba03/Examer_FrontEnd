import { Routes } from '@angular/router';
import {HomeComponent} from "./components/pages/home/home.component";
import {PageNotFoundedComponent} from "./components/pages/page-not-founded/page-not-founded.component";
import {LoginComponent} from "./components/pages/login/login.component";
import {ContactComponent} from "./components/pages/contact/contact.component";
import {ResetPasswordComponent} from "./components/pages/login/reset-password/reset-password.component";
import {OtpVerificationComponent} from "./components/pages/login/otp-verification/otp-verification.component";
import {NewPasswordComponent} from "./components/pages/login/new-password/new-password.component";
import {ExamsComponent} from "./components/dashboards/admin-dashboard/exams/exams.component";
import {AdminDashboardComponent} from "./components/dashboards/admin-dashboard/admin-dashboard.component";
import {PagesComponent} from "./components/pages/pages.component";
import {SuperAdminDashboardComponent} from "./components/dashboards/super-admin-dashboard/super-admin-dashboard.component";
import {ChangeInfoComponent} from "./components/dashboards/admin-dashboard/adminProfile/change-info/change-info.component";
import {CategoriesComponent} from "./components/dashboards/super-admin-dashboard/categories/categories.component";
import {AddQuestionsComponent} from "./components/dashboards/super-admin-dashboard/add-questions/add-questions.component";
import {TakeExamComponent} from "./components/exam/take-exam/take-exam.component";
import {AnswerQuestionsComponent} from "./components/exam/answer-questions/answer-questions.component";
import {authGuard} from "./guards/auth.guard";
import {adminDashboardGuard} from "./guards/admin-dashboard.guard";
import {superAdminDashboardGuard} from "./guards/super-admin-dashboard.guard";

export const routes: Routes = [
  {path:'', redirectTo:'pages', pathMatch:'full'},
  {path:'pages', component:PagesComponent, children:[
      {path:'', redirectTo:'home',pathMatch:'full'},
      {path:'home', component:HomeComponent},
      {path:'contact', component:ContactComponent},
      {path:'login', component:LoginComponent},
      {path:'resetPassword', component:ResetPasswordComponent},
      {path:'otpVerification/:email', component:OtpVerificationComponent},
      {path:'newPassword/:email', component:NewPasswordComponent}
    ]},
  {path:'dashboard',canActivate:[authGuard], children:[
      {path: 'admin',canActivate:[adminDashboardGuard], component:AdminDashboardComponent, children:[
          {path:'' , redirectTo:'exams', pathMatch:'full'},
          {path:'exams' , component:ExamsComponent},
          {path:'newExam' , loadComponent:()=>import("./components/dashboards/admin-dashboard/new-exam/new-exam.component").then(c=>c.NewExamComponent)},
          {path:'addUserToExam/:examName/:id' , loadComponent:()=>import("./components/dashboards/admin-dashboard/add-user-to-exam/add-user-to-exam.component").then(c=>c.AddUserToExamComponent)},
          {path:'users' , loadComponent:()=>import("./components/dashboards/admin-dashboard/users/users.component").then(c=>c.UsersComponent)},
          {path:'addUser' , loadComponent:()=>import("./components/dashboards/admin-dashboard/add-user/add-user.component").then(c=>c.AddUserComponent)},
          {path:'deletedUsers' , loadComponent:()=>import("./components/dashboards/admin-dashboard/deleted-users/deleted-users.component").then(c=>c.DeletedUsersComponent)},
          {path:'score' , loadComponent:()=>import("./components/dashboards/admin-dashboard/score/score.component").then(c=>c.ScoreComponent)},
          {path:'profile' , loadComponent:()=>import("./components/dashboards/admin-dashboard/adminProfile/profile.component").then(c=>c.ProfileComponent),children:[
              {path:'', redirectTo:'changeInfo', pathMatch:'full'},
              {path:'changeInfo', component:ChangeInfoComponent},
              {path:'changePass', loadComponent:()=>import("./components/dashboards/admin-dashboard/adminProfile/change-pass/change-pass.component").then(c=>c.ChangePassComponent)}
            ]},
        ]},
      {path: 'superAdmin',canActivate:[superAdminDashboardGuard], component: SuperAdminDashboardComponent, children:[
          {path:'' , redirectTo:'categories', pathMatch:'full'},
          {path:'categories' , component:CategoriesComponent},
          {path:'addCategory' , loadComponent:()=>import("./components/dashboards/super-admin-dashboard/add-category/add-category.component").then(c=>c.AddCategoryComponent)},
          {path:'admins' , loadComponent:()=>import("./components/dashboards/super-admin-dashboard/admins/admins.component").then(c=>c.AdminsComponent)},
          {path:'addAdmin' , loadComponent:()=>import("./components/dashboards/super-admin-dashboard/add-admin/add-admin.component").then(c=>c.AddAdminComponent)},
          {path:'aiBot' , loadComponent:()=>import("./components/dashboards/super-admin-dashboard/ai-bot/ai-bot.component").then(c=>c.AiBotComponent)},
          {path:'generatedQuestions' , loadComponent:()=>import("./components/dashboards/super-admin-dashboard/generated-question/generated-question.component").then(c=>c.GeneratedQuestionComponent)},
          {path:'deletedAdmins' , loadComponent:()=>import("./components/dashboards/super-admin-dashboard/deleted-admins/deleted-admins.component").then(c=>c.DeletedAdminsComponent)},
          {path:'editCategory/:category' , loadComponent:()=>import("./components/dashboards/super-admin-dashboard/edit-category/edit-category.component").then(c=>c.EditCategoryComponent)},
          {path:'addQuestions/:category' , component: AddQuestionsComponent},
          {path:'profile' , loadComponent:()=>import("./components/dashboards/super-admin-dashboard/profile/profile.component").then(c=>c.ProfileComponent),children:[
              {path:'', redirectTo:'changeInfo', pathMatch:'full'},
              {path:'changeInfo', loadComponent:()=>import("./components/dashboards/super-admin-dashboard/profile/change-info/change-info.component").then(c=>c.ChangeInfoComponent)},
              {path:'changePass', loadComponent:()=>import("./components/dashboards/super-admin-dashboard/profile/change-pass/change-pass.component").then(c=>c.ChangePassComponent)}
            ]},
        ]},
    ]},
  {path: 'exam', children:[
      {path: '', redirectTo: 'takeExam', pathMatch: 'full'},
      {path: 'takeExam', component: TakeExamComponent},
      {path: 'answerQuestions/:id', component: AnswerQuestionsComponent}
    ]},
  {path:'**', component:PageNotFoundedComponent},
];
