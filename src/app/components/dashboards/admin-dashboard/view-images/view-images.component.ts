import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-images.component.html',
  styleUrl: './view-images.component.scss',
})
export class ViewImagesComponent implements OnInit, OnDestroy {
  examId!: number;
  studentId!: number;
  images: string[] = [];
  selectedIndex: number | null = null; // الصورة المختارة حالياً

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.examId = Number(this.route.snapshot.paramMap.get('examId'));
    this.studentId = Number(this.route.snapshot.paramMap.get('studentId'));

    this.adminService.getImagesByExamAndStudent(this.examId, this.studentId)
      .subscribe({
        next: (res: string[]) => {
          this.images = res;
        },
        error: (err) => console.error('Error fetching images:', err)
      });
  }

  // لفتح الـ Modal
  openGallery(index: number) {
    this.selectedIndex = index;
    document.body.style.overflow = 'hidden'; // منع السكرول في الخلفية
  }

  // لإغلاق الـ Modal
  closeGallery() {
    this.selectedIndex = null;
    document.body.style.overflow = 'auto';
  }

  nextImage() {
    if (this.selectedIndex !== null) {
      this.selectedIndex = (this.selectedIndex + 1) % this.images.length;
    }
  }

  prevImage() {
    if (this.selectedIndex !== null) {
      this.selectedIndex = (this.selectedIndex - 1 + this.images.length) % this.images.length;
    }
  }

  // دعم أزرار الكيبورد (الأسهم و Esc)
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.selectedIndex !== null) {
      if (event.key === 'ArrowRight') this.nextImage();
      if (event.key === 'ArrowLeft') this.prevImage();
      if (event.key === 'Escape') this.closeGallery();
    }
  }

  ngOnDestroy(): void {}
}