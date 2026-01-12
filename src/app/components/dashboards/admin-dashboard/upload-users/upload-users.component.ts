import { Component,inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-upload-users',
  standalone: true,
  imports: [],
  templateUrl: './upload-users.component.html',
  styleUrl: './upload-users.component.scss'
})
export class UploadUsersComponent {

     selectedFile: File | null = null;
      uploadProgress: number = 0;
      isDragOver: boolean = false;
    
      // private _Router = inject(Router);
      // private _AdminService = inject(AdminService);

      constructor(private _AuthService:AuthService,private _AdminService:AdminService,private _Router:Router) {}
  
  
    // File selection handler
      onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
          this.validateAndSetFile(file);
        }
      }
    
      // Validate file
      validateAndSetFile(file: File): void {
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ];
        const maxSize = 5 * 1024 * 1024; // 5MB
    
        if (!allowedTypes.includes(file.type)) {
          Swal.fire({
            title: 'Invalid File Type',
            text: 'Please upload only .xlsx or .xls files',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }
    
        if (file.size > maxSize) {
          Swal.fire({
            title: 'File Too Large',
            text: 'File size must be less than 5MB',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }
    
        this.selectedFile = file;
      }
    
      // Remove selected file
      removeFile(event: Event): void {
        event.stopPropagation();
        this.selectedFile = null;
        this.uploadProgress = 0;
      }
    
      // Drag and drop handlers
      onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
      }
    
      onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
      }
    
      onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          this.validateAndSetFile(files[0]);
        }
      }
    
      // Upload file
      uploadFile(): void {
        if (!this.selectedFile) {
          Swal.fire({
            title: 'No File Selected',
            text: 'Please select a file first',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
          return;
        }
    
        this.uploadProgress = 10; // Start progress

        this._AuthService.decodeToken();
        let adminId=this._AuthService.decodedTokenInfo.value.id;
    
        // Call the actual API
        this._AdminService.uploadUsersExcel(this.selectedFile, adminId).subscribe({
          next: (res) => {
            this.uploadProgress = 100;
            setTimeout(() => {
              this.handleUploadComplete(res.message || 'Users uploaded successfully');
            }, 500);
          },
          error: (err) => {
            this.uploadProgress = 0;
            Swal.fire({
              title: 'Upload Failed',
              text: err.error?.message || 'Failed to upload file. Please check the file format and try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
    
        // Simulate progress (optional - for better UX)
        const progressInterval = setInterval(() => {
          if (this.uploadProgress < 90) {
            this.uploadProgress += 10;
          } else {
            clearInterval(progressInterval);
          }
        }, 300);
      }
    
      handleUploadComplete(message: string): void {
        Swal.fire({
          title: 'Success!',
          text: message,
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.selectedFile = null;
          this.uploadProgress = 0;
          
          // Close modal
          const modalElement = document.getElementById('uploadExcelModal');
          if (modalElement) {
            const modalBackdrop = document.querySelector('.modal-backdrop');
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            document.body.classList.remove('modal-open');
            if (modalBackdrop) {
              modalBackdrop.remove();
            }
          }
    
          // Optional: Refresh the page or navigate
          // this._Router.navigate(['/dashboard/superAdmin/categories']);
        });
      }
    
      // Download template
      downloadTemplate(): void {
        // Create sample Excel data as CSV
        const templateData = [
          ['userName', 'email', 'phone'],
        ];
    
        // Convert to CSV format
        const csvContent = templateData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'users_template.csv';
        link.click();
        window.URL.revokeObjectURL(url);
    
        Swal.fire({
          title: 'Template Downloaded',
          text: 'Please fill in your questions and upload the file',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true
        });
      }
    
      // Show template preview modal
      showTemplatePreview(): void {
        const modalElement = document.getElementById('templatePreviewModal');
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
          document.body.classList.add('modal-open');
          
          // Create backdrop
          const backdrop = document.createElement('div');
          backdrop.classList.add('modal-backdrop', 'fade', 'show');
          document.body.appendChild(backdrop);
        }
      }
    
      // Show upload modal
      showUploadModal(): void {
        const modalElement = document.getElementById('uploadExcelModal');
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
          document.body.classList.add('modal-open');
          
          // Create backdrop
          const backdrop = document.createElement('div');
          backdrop.classList.add('modal-backdrop', 'fade', 'show');
          document.body.appendChild(backdrop);
        }
      }
    
      // Close upload modal
      closeUploadModal(): void {
        const modalElement = document.getElementById('uploadExcelModal');
        if (modalElement) {
          modalElement.classList.remove('show');
          modalElement.style.display = 'none';
          document.body.classList.remove('modal-open');
        }
    
        // Remove any backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach((b) => b.remove());
    
        // Reset state
        this.selectedFile = null;
        this.uploadProgress = 0;
      }
    
      // Close template preview modal
      closeTemplatePreview(): void {
        const modalElement = document.getElementById('templatePreviewModal');
        if (modalElement) {
          modalElement.classList.remove('show');
          modalElement.style.display = 'none';
          document.body.classList.remove('modal-open');
        }
    
        // Remove any backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach((b) => b.remove());
      }

}
