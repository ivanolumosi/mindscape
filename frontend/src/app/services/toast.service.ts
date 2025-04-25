import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  toasts$ = new Subject<Toast[]>();
  private nextId = 1;

  constructor() { }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    const toast: Toast = {
      message,
      type,
      id: this.nextId++
    };

    this.toasts.push(toast);
    this.toasts$.next([...this.toasts]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.remove(toast.id);
    }, 3000);
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toasts$.next([...this.toasts]);
  }

  clear(): void {
    this.toasts = [];
    this.toasts$.next([]);
  }
}