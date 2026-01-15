import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProctoringService {
  // متغير لتخزين ID الطالب الذي سيتم جلبه من التوكن
  private baseUrl: string = '/api/v1/proctoring';

  constructor(private _HttpClient: HttpClient) {
    // جلب الـ ID مباشرة عند تحميل الخدمة
  }

  // استخراج ID الطالب من التوكن الموجود في AuthService

  /**
   * إرسال لقطة الشاشة إلى الباك إند
   * @param image البايتات بصيغة Base64
   * @param examId رقم الامتحان الحالي
   */
  uploadSnapshot(
    image: string,
    examId: string,
    userId: number
  ): Observable<any> {
    const payload = {
      studentId: userId,
      examId: examId,
      image: image,
    };
    return this._HttpClient.post(`${this.baseUrl}/upload`, payload);
  }
}
