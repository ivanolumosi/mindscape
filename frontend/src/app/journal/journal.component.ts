import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface JournalEntry {
  id?: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
}

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.css'
})
export class JournalComponent implements OnInit {

  currentDate: string = '';
  selectedMood: string = '';
  newTag: string = '';
  filterTimeRange: string = 'week';
  
  // Sample quote for UI demonstration
  currentQuote = {
    text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.',
    author: 'Nelson Mandela'
  };
  
  // Empty journal entry form
  journalEntry: JournalEntry = {
    title: '',
    content: '',
    mood: '',
    tags: [],
    createdAt: new Date().toLocaleDateString()
  };
  
  // Sample mock entries for UI demonstration
  mockEntries: JournalEntry[] = [
    {
      id: '1',
      title: 'First day of college',
      content: 'Today was my first day at the new college. I was nervous but excited to meet new people and start this journey.',
      mood: 'Good',
      tags: ['College', 'New beginnings'],
      createdAt: 'Mar 14, 2025'
    },
    {
      id: '2',
      title: 'Anxiety about upcoming exam',
      content: 'I\'m feeling stressed about tomorrow\'s math exam. I studied a lot but still don\'t feel confident.',
      mood: 'Down',
      tags: ['Exam', 'Stress', 'College'],
      createdAt: 'Mar 13, 2025'
    },
    {
      id: '3',
      title: 'Great study session',
      content: 'Had a productive study session with my new friends. We covered a lot of material and I feel more prepared now.',
      mood: 'Great',
      tags: ['Study', 'Friends'],
      createdAt: 'Mar 12, 2025'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Format current date like "Saturday, March 15, 2025"
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    this.currentDate = new Date().toLocaleDateString('en-US', options);
  }

  // Select mood for the current entry
  selectMood(mood: string): void {
    this.selectedMood = mood;
    this.journalEntry.mood = mood;
  }

  // Add tag to the current entry
  addTag(): void {
    if (this.newTag.trim() && !this.journalEntry.tags.includes(this.newTag.trim())) {
      this.journalEntry.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  // Remove tag from the current entry
  removeTag(index: number): void {
    this.journalEntry.tags.splice(index, 1);
  }

  // Save the current journal entry (stub for now)
  saveJournalEntry(): void {
    if (!this.journalEntry.title || !this.journalEntry.content || !this.journalEntry.mood) {
      alert('Please fill in all required fields (title, content, and mood).');
      return;
    }

    // For now, just add to mock entries
    const newEntry = { 
      ...this.journalEntry,
      id: (this.mockEntries.length + 1).toString(),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    
    this.mockEntries.unshift(newEntry);
    this.clearForm();
    
    // In a real app, this would connect to a service
    console.log('Entry saved:', newEntry);
  }

  // Clear the journal entry form
  clearForm(): void {
    this.journalEntry = {
      title: '',
      content: '',
      mood: '',
      tags: [],
      createdAt: new Date().toLocaleDateString()
    };
    this.selectedMood = '';
    this.newTag = '';
  }
}

