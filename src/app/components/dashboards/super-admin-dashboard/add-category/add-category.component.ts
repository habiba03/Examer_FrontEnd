import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { SuperAdminService } from '../../../../services/super-admin.service'; // Adjust path as needed
declare var bootstrap: any;

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.scss'
})
export class AddCategoryComponent {

  isLoading: boolean = false;
  selectedFile: File | null = null;
  uploadProgress: number = 0;
  isDragOver: boolean = false;

  private _Router = inject(Router);
  private _SuperAdminService = inject(SuperAdminService);

  addCategoryForm: FormGroup = new FormGroup({
    category: new FormControl(null, Validators.required),
  });

  handleGenerate(addCategoryForm: FormGroup) {
    this._Router.navigate([`/dashboard/superAdmin/addQuestions/${addCategoryForm.value.category}`]);
  }

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

    // Call the actual API
    this._SuperAdminService.uploadQuestionsExcel(this.selectedFile, 0).subscribe({
      next: (res) => {
        this.uploadProgress = 100;
        setTimeout(() => {
          this.handleUploadComplete(res.message || 'Questions uploaded successfully');
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
      ['questionContent', 'difficulty', 'category', 'questionType', 'options','correctOptionIndexes'],
    ];

    // Convert to CSV format
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'questions_template.csv';
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
    this.openModal('templatePreviewModal');
  }

  // Show upload modal
  showUploadModal(): void {
    this.openModal('uploadExcelModal');
  }

  // Helper method to open modal
  private openModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true,
        focus: true
      });
      modal.show();
    }
  }

  // Helper method to close modal
  private closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
}