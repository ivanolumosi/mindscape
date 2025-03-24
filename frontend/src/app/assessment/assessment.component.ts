import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [CommonModule,FormsModule,SidebarComponent],
  templateUrl: './assessment.component.html',
  styleUrl: './assessment.component.css'
})
export class AssessmentComponent {
  currentDate: string = new Date().toDateString();
  selectedAssessment: string = '';

  // Mock assessments
  mockAssessments = [
    { title: 'JavaScript Basics' },
    { title: 'Angular Fundamentals' },
    { title: 'CSS Mastery' }
  ];

  // Mock questions
  questions = [
    { id: 1, text: 'What is TypeScript?' },
    { id: 2, text: 'Explain Angular Components.' }
  ];

  // Mock responses
  responses = [
    { id: 1, question: 'What is TypeScript?', answer: 'TypeScript is a superset of JavaScript.' }
  ];

  // Mock results
  results = {
    score: 85,
    rank: 'Top 10%',
    attempts: 2
  };

  newQuestion: string = '';

  // Load questions based on selected assessment (mock function)
  loadQuestions() {
    this.questions = [
      { id: 1, text: `Sample question for ${this.selectedAssessment}?` }
    ];
  }

  // Add a new question
  addQuestion() {
    if (this.newQuestion.trim()) {
      this.questions.push({
        id: this.questions.length + 1,
        text: this.newQuestion
      });
      this.newQuestion = '';
    }
  }

  // Delete a question
  deleteQuestion(id: number) {
    this.questions = this.questions.filter(q => q.id !== id);
  }

  // Edit a response (mock function)
  editResponse(id: number) {
    const response = this.responses.find(r => r.id === id);
    if (response) {
      const updatedAnswer = prompt('Edit your response:', response.answer);
      if (updatedAnswer !== null) {
        response.answer = updatedAnswer;
      }
    }
  }
}
