import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-take-exam',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './take-exam.component.html',
  styleUrl: './take-exam.component.scss'
})
export class TakeExamComponent implements OnInit {

  examId: any = '';
  userId: any = '';

  constructor(
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router
  ) {}

  async checkCameraAvailability(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');

      if (!hasCamera) {
        alert("No camera detected. You cannot start the exam.");
        return false;
      }

      return true;
    } catch (error) {
      alert("Unable to access camera.");
      return false;
    }
  }

  async ngOnInit(): Promise<void> {

    const cameraAvailable = await this.checkCameraAvailability();

    if (!cameraAvailable) {
      this._Router.navigate(['/']);
      return;
    }

    this.examId = this._ActivatedRoute.snapshot.queryParamMap.get("id");
    this.userId = this._ActivatedRoute.snapshot.queryParamMap.get("userId");

    console.log('Exam ID from query params take exam comp:', this.examId);
    console.log('User ID from query params take exam comp:', this.userId);
  }

}