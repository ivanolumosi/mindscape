import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { JournalService, DailyJournal } from '../services/journal.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.css'
})
export class JournalComponent implements OnInit {
  currentDate: string = '';
  selectedMood: string = '';
  filterTimeRange: string = 'week';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  isEditing: boolean = false;
  editingEntryId: number | null = null;
  userId: number = 0;
  
  // Journal statistics
  stats: {
    TotalEntries: number;
    FirstEntryDate: string | null;
    LastEntryDate: string | null;
    EntryStreak?: number;
    AverageMood?: string;
  } = {
    TotalEntries: 0,
    FirstEntryDate: null,
    LastEntryDate: null,
    EntryStreak: 0,
    AverageMood: 'N/A'
  };

  // Sample quote for UI demonstration
  currentQuote = {
    text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
    author: 'Nelson Mandela'
  };
  
  // Journal entry form data
  journalEntry: {
    id?: number;
    entry_date: string;
    mood: string;
    reflections: string;
    gratitude: string;
  } = {
    entry_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    mood: '',
    reflections: '',
    gratitude: ''
  };
  
  // Journal entries
  journalEntries: DailyJournal[] = [];

  constructor(
    private journalService: JournalService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Format current date like "Saturday, March 15, 2025"
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    this.currentDate = new Date().toLocaleDateString('en-US', options);
    
    // Get current user ID
    const currentUserId = this.authService.getCurrentUserId();
    if (currentUserId) {
      this.userId = currentUserId;
      this.loadJournalEntries();
      this.loadJournalStatistics();
    } else {
      this.errorMessage = 'User not authenticated. Please log in.';
    }
  }

  // Select mood for the current entry
  selectMood(mood: string): void {
    this.selectedMood = mood;
    this.journalEntry.mood = mood;
  }

  // Load journal entries based on selected time range
  loadJournalEntries(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    if (this.filterTimeRange === 'all') {
      this.journalService.getJournalEntriesByUser(this.userId).subscribe({
        next: (entries) => {
          this.journalEntries = entries;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load journal entries: ' + (error.message || 'Unknown error');
          this.isLoading = false;
        }
      });
    } else {
      const today = new Date();
      let startDate = new Date();
      
      // Calculate start date based on filter
      if (this.filterTimeRange === 'week') {
        startDate.setDate(today.getDate() - 7);
      } else if (this.filterTimeRange === 'month') {
        startDate.setMonth(today.getMonth() - 1);
      } else if (this.filterTimeRange === 'year') {
        startDate.setFullYear(today.getFullYear() - 1);
      }
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = today.toISOString().split('T')[0];
      
      this.journalService.getJournalEntriesByDateRange(
        this.userId, 
        formattedStartDate, 
        formattedEndDate
      ).subscribe({
        next: (entries) => {
          this.journalEntries = entries;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load journal entries: ' + (error.message || 'Unknown error');
          this.isLoading = false;
        }
      });
    }
  }

  // Load journal statistics
  loadJournalStatistics(): void {
    this.journalService.getJournalStatistics(this.userId).subscribe({
      next: (stats) => {
        this.stats = {
          ...stats,
          EntryStreak: this.calculateStreak(),
          AverageMood: this.calculateAverageMood()
        };
      },
      error: (error) => {
        console.error('Failed to load journal statistics:', error);
      }
    });
  }

  // Calculate streak (approximation)
  calculateStreak(): number {
    // This is a placeholder - would need actual consecutive days logic
    return Math.min(7, this.stats.TotalEntries);
  }

  // Calculate average mood (approximation)
  calculateAverageMood(): string {
    const moods = this.journalEntries.map(entry => entry.mood).filter(mood => !!mood);
    if (moods.length === 0) return 'N/A';
    
    const moodCounts: {[key: string]: number} = {};
    let highestCount = 0;
    let dominantMood = 'N/A';
    
    moods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      if (moodCounts[mood] > highestCount) {
        highestCount = moodCounts[mood];
        dominantMood = mood;
      }
    });
    
    return dominantMood;
  }

  // Apply filter and load entries
  applyFilter(): void {
    this.loadJournalEntries();
  }

  // Save the current journal entry
  saveJournalEntry(): void {
    if (!this.journalEntry.mood || !this.journalEntry.reflections || !this.journalEntry.gratitude) {
      this.errorMessage = 'Please fill in all required fields (mood, reflections, and gratitude).';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    // Add debugging to see what we're sending
    console.log('Saving journal entry:', {
      ...this.journalEntry,
      user_id: this.userId
    });
    
    if (this.isEditing && this.editingEntryId) {
      // Update existing entry
      this.journalService.updateJournalEntry(this.editingEntryId, {
        mood: this.journalEntry.mood,
        reflections: this.journalEntry.reflections,
        gratitude: this.journalEntry.gratitude
      }).subscribe({
        next: (updatedEntry) => {
          const index = this.journalEntries.findIndex(entry => entry.id === updatedEntry.id);
          if (index !== -1) {
            this.journalEntries[index] = updatedEntry;
          }
          this.successMessage = 'Journal entry updated successfully!';
          this.clearForm();
          this.loadJournalStatistics();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Update error:', error);
          this.errorMessage = 'Failed to update journal entry: ' + (error.message || error.error?.message || 'Unknown error');
          this.isLoading = false;
        }
      });
    } else {
      // Add new entry
      this.journalService.addJournalEntry({
        user_id: this.userId,
        entry_date: this.journalEntry.entry_date,
        mood: this.journalEntry.mood,
        reflections: this.journalEntry.reflections,
        gratitude: this.journalEntry.gratitude
      }).subscribe({
        next: (newEntry) => {
          this.journalEntries.unshift(newEntry);
          this.successMessage = 'Journal entry saved successfully!';
          this.clearForm();
          this.loadJournalStatistics();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Add error:', error);
          this.errorMessage = 'Failed to save journal entry: ' + (error.message || error.error?.message || 'Unknown error');
          this.isLoading = false;
        }
      });
    }
  }
  
  // Edit an existing journal entry
  editJournalEntry(entry: DailyJournal): void {
    if (!entry || !entry.id) {
      this.errorMessage = 'Cannot edit entry: Invalid entry data';
      return;
    }
    
    this.isEditing = true;
    this.editingEntryId = entry.id;
    this.journalEntry = {
      entry_date: typeof entry.entry_date === 'string' ? entry.entry_date : 
                 (entry.entry_date ? new Date(entry.entry_date).toISOString().split('T')[0] : 
                 new Date().toISOString().split('T')[0]),
      mood: entry.mood || '',
      reflections: entry.reflections || '',
      gratitude: entry.gratitude || ''
    };
    this.selectedMood = entry.mood || '';
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Delete a journal entry
  deleteJournalEntry(id: number | undefined): void {
    if (!id) {
      this.errorMessage = 'Cannot delete entry: Invalid ID';
      return;
    }
    
    if (confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      this.isLoading = true;
      this.journalService.deleteJournalEntry(id).subscribe({
        next: () => {
          this.journalEntries = this.journalEntries.filter(entry => entry.id !== id);
          this.successMessage = 'Journal entry deleted successfully!';
          this.loadJournalStatistics();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.errorMessage = 'Failed to delete journal entry: ' + (error.message || error.error?.message || 'Unknown error');
          this.isLoading = false;
        }
      });
    }
  }

  // Clear the journal entry form
  clearForm(): void {
    this.journalEntry = {
      entry_date: new Date().toISOString().split('T')[0],
      mood: '',
      reflections: '',
      gratitude: ''
    };
    this.selectedMood = '';
    this.isEditing = false;
    this.editingEntryId = null;
    // Clear messages after a delay
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
  
  // Format date for display
  formatDate(dateString: string | Date | null): string {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  }
  
  // Helper method to safely get mood class
  getMoodClass(mood: string | undefined | null): string {
    if (!mood) return 'default-mood';
    return mood.toLowerCase();
  }
}