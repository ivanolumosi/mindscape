import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService, User, Seeker, Counselor } from '../services/profile.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  profileForm: FormGroup;
  user: User | null = null;
  isSeeker: boolean = true;
  isLoading: boolean = false;
  submitSuccess: boolean = false;
  errorMessage: string = '';
  isFirstTimeUser: boolean = false;
  uploadingImage: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  successMessage: string = '';

  faculties: string[] = [
    'Arts', 'Business', 'Education', 'Engineering', 
    'Health Sciences', 'Law', 'Medicine', 'Science', 'Other'
  ];

  specializations: string[] = [
    'Anxiety & Depression', 'Career Counseling', 'Family Therapy',
    'Grief & Loss', 'LGBTQ+ Support', 'Relationship Issues',
    'Stress Management', 'Trauma Recovery', 'Other'
  ];

  defaultProfileImage: string = 'assets/images/avatar1.png';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.isLoading = true;

    this.route.queryParams.subscribe(params => {
      this.isFirstTimeUser = params['firstLogin'] === 'true';
      const userIdParam = params['userId'];
      const userId = userIdParam ? Number(userIdParam) : this.getUserIdFromStorage();

      if (userId) {
        this.profileService.getUserProfile(userId).subscribe({
          next: (userData) => {
            this.user = userData;
            this.isSeeker = userData.role === 'seeker';
            this.updateForm(userData);
            this.isLoading = false;

            if (!this.isFirstTimeUser && userData.isProfileComplete) {
              this.router.navigate(['/userdash']);
            }
          },
          error: (error) => {
            console.error('Failed to load user profile', error);
            this.handleProfileLoadError();
          }
        });
      } else {
        this.handleProfileLoadError();
      }
    });
  }

  private handleProfileLoadError(): void {
    this.errorMessage = 'User not found. Please log in again.';
    this.isLoading = false;
    setTimeout(() => this.router.navigate(['/login']), 3000);
  }

  private getUserIdFromStorage(): number | null {
    const userData = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.userId || user.id || null;
      } catch (e) {
        console.error('Error parsing user data from storage', e);
        return null;
      }
    }
    return null;
  }

  private createForm(): FormGroup {
    return this.fb.group({
      userId: [''],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      faculty: [''],
      profileImage: [this.defaultProfileImage],
      wantsDailyEmails: [false],
      specialization: [''],
      availabilitySchedule: ['']
    });
  }

  private updateForm(user: User): void {
    this.profileForm.patchValue({
      userId: user.userId || user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage || this.defaultProfileImage,
      wantsDailyEmails: (user as Seeker).wantsDailyEmails || false
    });

    if (this.isSeeker) {
      this.profileForm.patchValue({
        faculty: (user as Seeker).faculty || ''
      });
    } else {
      this.profileForm.patchValue({
        specialization: (user as Counselor).specialization || '',
        availabilitySchedule: (user as Counselor).availabilitySchedule || ''
      });
    }
    this.previewUrl = user.profileImage || this.defaultProfileImage;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.profileForm.value;

    if (this.isSeeker) {
      const seekerData: Partial<Seeker> = {
        userId: formValue.userId,
        name: formValue.name,
        email: formValue.email,
        faculty: formValue.faculty,
        profileImage: formValue.profileImage || this.defaultProfileImage,
        wantsDailyEmails: formValue.wantsDailyEmails
      };

      this.profileService.updateSeekerProfile(seekerData).subscribe({
        next: () => this.handleSuccess(),
        error: (error) => this.handleError(error)
      });
    } else {
      const counselorData: Partial<Counselor> = {
        userId: formValue.userId,
        name: formValue.name,
        email: formValue.email,
        profileImage: formValue.profileImage || this.defaultProfileImage,
        specialization: formValue.specialization,
        availabilitySchedule: formValue.availabilitySchedule
      };

      this.profileService.updateCounselorProfile(counselorData).subscribe({
        next: () => this.handleSuccess(),
        error: (error) => this.handleError(error)
      });
    }
  }

  private handleSuccess(): void {
    this.isLoading = false;
    this.submitSuccess = true;
    setTimeout(() => {
      this.router.navigate(['/userdash']);
    }, 2000);
  }

  private handleError(error: any): void {
    this.isLoading = false;
    console.error('Profile update error:', error);
    this.errorMessage = error.message || 'Failed to update profile. Please try again.';
  }

  skipProfile(): void {
    if (!this.isSeeker) {
      this.errorMessage = 'Counselors must complete their profile before continuing.';
      return;
    }

    this.profileForm.reset();
    this.submitSuccess = true;
    this.successMessage = 'Skipping profile setup. Redirecting to dashboard...';

    setTimeout(() => {
      this.profileService.skipProfileSetup();
    }, 1500);
  }
  handleImageLinkChange(event: any): void {
    const imageUrl = event.target.value;
    this.previewUrl = imageUrl; // Update live preview
    this.profileForm.patchValue({
      profileImage: imageUrl // Save in form
    });
  }
  
  handleImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadingImage = true;
  
      this.profileService.uploadProfileImage(file).subscribe({
        next: (updatedUser) => {
          this.uploadingImage = false;
          this.profileForm.patchValue({
            profileImage: updatedUser.profileImage
          });
        },
        error: (error) => {
          console.error('Error uploading profile image', error);
          this.uploadingImage = false;
        }
      });
    }
  }
  

  canSkipProfile(): boolean {
    return this.isSeeker && this.isFirstTimeUser;
  }
}
