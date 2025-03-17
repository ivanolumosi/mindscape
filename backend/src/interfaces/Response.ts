export interface Response {
    id: number;                         // Unique identifier for each response
    user_id: number;                    // ID of the user who submitted the response
    question_id: number;                // ID of the question being answered
    response_text?: string;             // User's response (for open-ended questions)
    selected_option?: string;           // User's selected option (for multiple-choice questions)
    submitted_at: Date;                 // When the response was submitted
  }
  