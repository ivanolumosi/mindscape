import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'   // <-- THIS IS IMPORTANT
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    const id = ++this.counter;
    const toast: Toast = { id, message, type };
    const toasts = [...this.toastsSubject.value, toast];
    this.toastsSubject.next(toasts);

    setTimeout(() => this.remove(id), 5000); // Auto-remove after 5s
  }

  remove(id: number): void {
    const toasts = this.toastsSubject.value.filter(toast => toast.id !== id);
    this.toastsSubject.next(toasts);
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'info': return 'fa-info-circle';
      case 'warning': return 'fa-exclamation-triangle';
      default: return 'fa-bell';
    }
  }
}