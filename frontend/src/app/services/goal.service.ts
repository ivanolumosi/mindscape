import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Goal {
title: any;
user_name: any;
target_date: string|Date;
description: any;
  id?: number;
  user_id?: number;
  goal_title: string;
  goal_description: string | null;
  goal_type: 'Daily' | 'Weekly' | 'Monthly';
  due_date: string | null;
  progress_percentage: number;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
  category?: string; // Added category property
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private apiUrl = 'http://localhost:3000/api/goals';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Add a new goal
  addGoal(goal: {
    goalTitle: string,
    goalDescription: string | null,
    goalType: 'Daily' | 'Weekly' | 'Monthly',
    dueDate: string | null,
    category?: string // Added category parameter
  }): Observable<Goal> {
    const userId = this.authService.getCurrentUserId();
    return this.http.post<Goal>(this.apiUrl, {
      userId,
      goalTitle: goal.goalTitle,
      goalDescription: goal.goalDescription,
      goalType: goal.goalType,
      dueDate: goal.dueDate,
      category: goal.category // Include category in API call
    });
  }

  // Delete a goal
  deleteGoal(goalId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${goalId}`);
  }

  // Get all goals for current user
  getGoals(): Observable<Goal[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<Goal[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Get goals by completion status
  getGoalsByStatus(isCompleted: boolean): Observable<Goal[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<Goal[]>(`${this.apiUrl}/user/${userId}/status?isCompleted=${isCompleted}`);
  }

  // Get specific goal by ID
  getGoalById(goalId: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.apiUrl}/${goalId}`);
  }

  // Track goal progress
  trackGoalProgress(goalId: number): Observable<{ progress_percentage: number }> {
    return this.http.get<{ progress_percentage: number }>(`${this.apiUrl}/${goalId}/progress`);
  }

  // Update goal status and progress
  updateGoalStatus(goalId: number, isCompleted: boolean, progressPercentage: number): Observable<Goal> {
    return this.http.patch<Goal>(`${this.apiUrl}/${goalId}/status`, {
      isCompleted,
      progressPercentage
    });
  }
}