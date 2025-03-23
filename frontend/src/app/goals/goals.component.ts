import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  progress: number;
  dueDate: string;
  isCompleted: boolean;
  priority: 'Low' | 'Medium' | 'High';
}
@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule,FormsModule,SidebarComponent],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.css'
})
export class GoalsComponent {
  goals: Goal[] = [];
  categories: string[] = ['Mental Health', 'Physical Health', 'Personal Growth', 'Social', 'Career'];
  selectedCategory: string = 'All';
  showAddGoalForm: boolean = false;
  newGoal: Goal = {
    id: 0,
    title: '',
    description: '',
    category: 'Mental Health',
    progress: 0,
    dueDate: '',
    isCompleted: false,
    priority: 'Medium'
  };
new: any;

  constructor() { }

  ngOnInit(): void {
    // Load dummy data
    this.loadDummyGoals();
  }

  loadDummyGoals(): void {
    this.goals = [
      {
        id: 1,
        title: 'Practice mindfulness meditation',
        description: 'Meditate for 10 minutes daily to reduce anxiety',
        category: 'Mental Health',
        progress: 80,
        dueDate: '2025-04-15',
        isCompleted: false,
        priority: 'High'
      },
      {
        id: 2,
        title: 'Read self-help books',
        description: 'Complete reading "Atomic Habits" and take notes',
        category: 'Personal Growth',
        progress: 65,
        dueDate: '2025-03-30',
        isCompleted: false,
        priority: 'Medium'
      },
      {
        id: 3,
        title: 'Join a study group',
        description: 'Find and join a study group for final exams',
        category: 'Social',
        progress: 50,
        dueDate: '2025-03-25',
        isCompleted: false,
        priority: 'Medium'
      },
      {
        id: 4,
        title: 'Complete sleep assessment',
        description: 'Track sleep patterns for a week and analyze results',
        category: 'Physical Health',
        progress: 0,
        dueDate: '2025-04-10',
        isCompleted: false,
        priority: 'Low'
      },
      {
        id: 5,
        title: 'Exercise regularly',
        description: 'Go for a 30-minute walk at least 3 times per week',
        category: 'Physical Health',
        progress: 40,
        dueDate: '2025-05-01',
        isCompleted: false,
        priority: 'High'
      },
      {
        id: 6,
        title: 'Learn to manage stress',
        description: 'Identify personal stress triggers and develop coping mechanisms',
        category: 'Mental Health',
        progress: 30,
        dueDate: '2025-04-20',
        isCompleted: false,
        priority: 'High'
      },
      {
        id: 7,
        title: 'Build professional portfolio',
        description: 'Create and organize work samples for future job applications',
        category: 'Career',
        progress: 20,
        dueDate: '2025-06-15',
        isCompleted: false,
        priority: 'Medium'
      }
    ];
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
  }

  getFilteredGoals(): Goal[] {
    if (this.selectedCategory === 'All') {
      return this.goals;
    }
    return this.goals.filter(goal => goal.category === this.selectedCategory);
  }

  toggleAddGoalForm(): void {
    this.showAddGoalForm = !this.showAddGoalForm;
  }

  saveNewGoal(): void {
    // In a real app, this would send data to a service
    this.newGoal.id = this.goals.length + 1;
    this.goals.push({...this.newGoal});
    
    // Reset form
    this.newGoal = {
      id: 0,
      title: '',
      description: '',
      category: 'Mental Health',
      progress: 0,
      dueDate: '',
      isCompleted: false,
      priority: 'Medium'
    };
    
    this.showAddGoalForm = false;
  }

  updateGoalProgress(goal: Goal, progress: number): void {
    goal.progress = progress;
    if (progress === 100) {
      goal.isCompleted = true;
    }
  }

  deleteGoal(goalId: number): void {
    this.goals = this.goals.filter(goal => goal.id !== goalId);
  }
}