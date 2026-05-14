import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AdminService } from "../../../../services/admin.service";
import { AuthService } from "../../../../services/auth.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { NgIf } from "@angular/common";
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { IuserContentData } from "../../../../interfaces/iuser";
import { PaginatorModule } from "primeng/paginator";
import { AlphabeticalOrderPipe } from "../../../../pipes/alphabetical-order.pipe";
import { FormsModule } from "@angular/forms";
import { forkJoin } from "rxjs";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    ToastModule,
    ConfirmDialogModule,
    PaginatorModule,
    AlphabeticalOrderPipe,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  updateUserForm: FormGroup = new FormGroup({
    userName: new FormControl(null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]{1,20}$/)]),
    phone: new FormControl(null, [Validators.required, Validators.pattern(/^(010|011|012|015)[0-9]{8}$/)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
  });

  users: IuserContentData[] = [];
  allUsers: IuserContentData[] = [];        
  filteredUsers: IuserContentData[] = [];  
  searchTerm: string = '';                  
  isSearching: boolean = false;            

  userId!: number;
  isLoading: boolean = false;
  adminId: number = 0;
  first: number = 0;
  totalPages: number = 0;

  constructor(
    private _AdminService: AdminService,
    private _AuthService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this._AuthService.decodeToken();
    this.adminId = this._AuthService.decodedTokenInfo.value.id;
    this.loadUsers();
  }

  // Load current page from server
  loadUsers(): void {
    this._AdminService.getAllUsers(this.adminId, this.first).subscribe({
      next: (res) => {
        this.users = res.data.content;
        this.totalPages = res.data.totalPages;
        if (!this.isSearching) {
          this.filteredUsers = [...this.users];
        }
        this.isLoading = false;
        this.loadAllUsers();  // fetch all pages in background
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  loadAllUsers(): void {
    if (this.totalPages <= 1) {
      this.allUsers = [...this.users];
      return;
    }
    const requests = [];
    for (let i = 0; i < this.totalPages; i++) {
      requests.push(this._AdminService.getAllUsers(this.adminId, i));
    }
    forkJoin(requests).subscribe({
      next: (results) => {
        this.allUsers = [];
        results.forEach(res => {
          this.allUsers.push(...res.data.content);
        });
        if (this.isSearching) {
          this.onSearch();
        }
      }
    });
  }

  // Paginator event
  onPageChange(event: any): void {
    this.first = event.first;
    this.isLoading = true;
    this._AdminService.getAllUsers(this.adminId, this.first).subscribe({
      next: (res) => {
        this.users = res.data.content;
        this.totalPages = res.data.totalPages;
        this.filteredUsers = [...this.users];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.isSearching = false;
      this.filteredUsers = [...this.users];
    } else {
      this.isSearching = true;
      this.filteredUsers = this.allUsers.filter(user =>
        (user.userName?.toLowerCase() ?? '').includes(term) ||
        (user.email?.toLowerCase() ?? '').includes(term) ||
        (user.phone?.toString() ?? '').includes(term)
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.filteredUsers = [...this.users];
  }

  handleDelete(event: Event, userId: number): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      accept: () => {
        this.isLoading = true;
        this._AdminService.deleteUser(userId, this.first).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.users = res.data.content;
            this.totalPages = res.data.totalPages;
            this.messageService.add({ severity: 'info', summary: 'Confirmed', key: 'bc', detail: 'Record deleted' });
          },
          error: (err) => {
            this.isLoading = false;
          }
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', key: 'bc', detail: 'You have rejected' });
      }
    });
  }

  // Get user data for update modal
  handleGetuser(id: number): void {
    this._AdminService.getuser(id).subscribe({
      next: (res) => {
        this.userId = res.data.userId;
        this.updateUserForm.get("userName")?.setValue(res.data.userName);
        this.updateUserForm.get("phone")?.setValue(res.data.phone);
        this.updateUserForm.get("email")?.setValue(res.data.email);
      },
      error: (err) => {}
    });
  }

  // Update user
  handleUpdateUser(updateUserForm: FormGroup): void {
    this.isLoading = true;
    this._AdminService.updateUser(updateUserForm.value, this.userId, this.first).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.users = res.data.content;
        this.totalPages = res.data.totalPages;
        this.messageService.add({ severity: 'success', summary: 'Success', key: 'bc', detail: res.message });
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', key: 'bc', detail: err.error.message });
      }
    });
  }
}