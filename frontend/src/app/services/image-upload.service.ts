import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Upload image to server and get back a URL
   */
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ url: string }>(`${this.apiUrl}/upload-image`, formData);
  }

  /**
   * Helper method to compress image before upload
   * Returns a promise with compressed file
   */
  compressImage(file: File, maxSizeKB: number = 500): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1200;
          if (width > height && width > maxDimension) {
            height = Math.round(height * maxDimension / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round(width * maxDimension / height);
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Start with high quality
          let quality = 0.9;
          let compressedFile: File | null = null;
          
          const compressRecursive = () => {
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Canvas to Blob conversion failed'));
                return;
              }
              
              // Create new file from blob
              compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              // Check size, if still too large, compress more
              if (compressedFile.size > maxSizeKB * 1024 && quality > 0.1) {
                quality -= 0.1;
                compressRecursive();
              } else {
                resolve(compressedFile);
              }
            }, 'image/jpeg', quality);
          };
          
          compressRecursive();
        };
        
        img.onerror = () => {
          reject(new Error('Error loading image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
    });
  }
}