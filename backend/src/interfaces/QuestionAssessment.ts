export interface QuestionAssessment {
    id: number;                         // Unique identifier for each question/assessment
    assessment_title: string;           // Title of the assessment
    question_text: string;              // Text of the question
    question_type: 'Multiple Choice' | 'Open Ended' | 'Scale';  // Type of the question
    options?: string;                   // Comma-separated options for multiple-choice questions
    is_required: boolean;               // Whether the question is mandatory
    created_at: Date;                   // Timestamp when the question/assessment was created
    updated_at: Date;                   // Timestamp when the question/assessment was last updated
  }
  