import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MoodService, MoodTracker, MoodStatistic } from '../services/mood.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-mood',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SidebarComponent],
  templateUrl: './mood.component.html',
  styleUrl: './mood.component.css'
})
export class MoodComponent  implements OnInit {
  moodForm: FormGroup;
  userMoods: MoodTracker[] = [];
  moodStats: MoodStatistic[] = [];
  moodOptions: string[] = [];
  isLoading = false;
  dateRange = {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    endDate: new Date()
  };
  
  constructor(
    private fb: FormBuilder,
    private moodService: MoodService
  ) {
    this.moodForm = this.fb.group({
      mood: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.moodOptions = this.moodService.getMoodOptions();
    this.loadUserMoods();
    this.loadMoodStatistics();
  }

  loadUserMoods(): void {
    this.isLoading = true;
    this.moodService.getCurrentUserMoods().subscribe({
      next: (moods) => {
        this.userMoods = moods;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading moods:', error);
        this.isLoading = false;
      }
    });
  }

  loadMoodsByDateRange(): void {
    this.isLoading = true;
    this.moodService.getMoodsByDateRange(this.dateRange.startDate, this.dateRange.endDate)
      .subscribe({
        next: (moods) => {
          this.userMoods = moods;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading moods by date range:', error);
          this.isLoading = false;
        }
      });
  }

  loadMoodStatistics(): void {
    this.moodService.getCurrentUserMoodStatistics().subscribe({
      next: (stats) => {
        this.moodStats = stats;
      },
      error: (error) => {
        console.error('Error loading mood statistics:', error);
      }
    });
  }

  submitMood(): void {
    if (this.moodForm.valid) {
      const { mood, notes } = this.moodForm.value;
      
      this.moodService.addMoodEntry(mood, notes).subscribe({
        next: () => {
          // Reset form after successful submission
          this.moodForm.reset();
          
          // Reload moods to show the newly added entry
          this.loadUserMoods();
          this.loadMoodStatistics();
        },
        error: (error) => {
          console.error('Error adding mood entry:', error);
        }
      });
    }
  }

  deleteMood(id: number): void {
    if (confirm('Are you sure you want to delete this mood entry?')) {
      this.moodService.deleteMoodEntry(id).subscribe({
        next: () => {
          // Reload moods after deletion
          this.loadUserMoods();
          this.loadMoodStatistics();
        },
        error: (error) => {
          console.error('Error deleting mood entry:', error);
        }
      });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  updateDateRange(startDate: string, endDate: string): void {
    this.dateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };
    this.loadMoodsByDateRange();
  }
}