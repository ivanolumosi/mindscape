import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';
import { Goal, GoalService } from '../services/goal.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];
  categories = ['Mental Health', 'Physical Health', 'Personal Growth', 'Social', 'Career'];
  goalTypes: ('Daily' | 'Weekly' | 'Monthly')[] = ['Daily', 'Weekly', 'Monthly'];
  selectedCategory: string = 'All';
  showAddGoalForm: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  userName: string = ''; // Added userName property
  today: Date = new Date(); // Added today property for date pipe
  
  newGoal = {
    goalTitle: '',
    goalDescription: '',
    goalType: 'Weekly' as 'Daily' | 'Weekly' | 'Monthly',
    dueDate: '',
    category: 'Mental Health'
  };

  constructor(
    private goalService: GoalService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadGoals();
    this.getUserName();
  }

  // Add method to get the user name
  getUserName(): void {
    const currentUser = this.authService.getCurrentUser();
    this.userName = currentUser?.name || 'User';
  }

  loadGoals(): void {
    this.isLoading = true;
    this.goalService.getGoals()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (goals) => {
          this.goals = goals;
          // Add category field to each goal for filtering (since backend doesn't have category)
          this.goals.forEach(goal => {
            // Assign a random category for demo purposes if not already set
            if (!goal.category) {
              goal.category = this.categories[Math.floor(Math.random() * this.categories.length)];
            }
          });
        },
        error: (err) => {
          console.error('Error loading goals', err);
          this.error = 'Failed to load goals. Please try again.';
        }
      });
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
    if (this.showAddGoalForm) {
      // Reset form
      this.newGoal = {
        goalTitle: '',
        goalDescription: '',
        goalType: 'Weekly',
        dueDate: '',
        category: 'Mental Health'
      };
    }
  }

  saveNewGoal(): void {
    if (!this.newGoal.goalTitle) {
      this.error = 'Goal title is required';
      return;
    }

    this.isLoading = true;
    this.goalService.addGoal({
      goalTitle: this.newGoal.goalTitle,
      goalDescription: this.newGoal.goalDescription || null,
      goalType: this.newGoal.goalType,
      dueDate: this.newGoal.dueDate || null,
      category: this.newGoal.category
    })
    .pipe(finalize(() => this.isLoading = false))
    .subscribe({
      next: (goal) => {
        // Ensure the category is set
        if (!goal.category) {
          goal.category = this.newGoal.category;
        }
        this.goals.push(goal);
        this.showAddGoalForm = false;
        this.error = null;
      },
      error: (err) => {
        console.error('Error adding goal', err);
        this.error = 'Failed to add goal. Please try again.';
      }
    });
  }

  updateGoalProgress(goal: Goal, progress: number): void {
    if (progress < 0) progress = 0;
    if (progress > 100) progress = 100;
    
    const isCompleted = progress === 100;
    
    this.goalService.updateGoalStatus(goal.id!, isCompleted, progress)
      .subscribe({
        next: (updatedGoal) => {
          // Update the local goal object
          const index = this.goals.findIndex(g => g.id === goal.id);
          if (index !== -1) {
            // Preserve the category we added for frontend
            if (!updatedGoal.category) {
              updatedGoal.category = goal.category;
            }
            this.goals[index] = updatedGoal;
          }
        },
        error: (err) => {
          console.error('Error updating goal progress', err);
          // Revert progress change on error
          goal.progress_percentage = goal.progress_percentage || 0;
        }
      });
  }

  deleteGoal(goalId: number): void {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.goalService.deleteGoal(goalId)
        .subscribe({
          next: (success) => {
            if (success) {
              this.goals = this.goals.filter(goal => goal.id !== goalId);
            } else {
              this.error = 'Failed to delete goal.';
            }
          },
          error: (err) => {
            console.error('Error deleting goal', err);
            this.error = 'Failed to delete goal. Please try again.';
          }
        });
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  }

  getTotalGoalsCount(): number {
    return this.goals.length;
  }

  getCompletedGoalsCount(): number {
    return this.goals.filter(goal => goal.is_completed).length;
  }

  getOverdueGoalsCount(): number {
    const today = new Date();
    return this.goals.filter(goal => 
      !goal.is_completed && 
      goal.due_date && 
      new Date(goal.due_date) < today
    ).length;
  }

  getHighPriorityGoalsCount(): number {
    // Simulate priority since the backend doesn't have it
    return Math.floor(this.goals.filter(goal => !goal.is_completed).length / 3);
  }
}