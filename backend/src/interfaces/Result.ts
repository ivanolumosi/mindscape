export interface Result {
    id: number;                          // Unique identifier for each result
    user_id: number;                     // ID of the user who completed the assessment
    assessment_title: string;            // Title of the assessment
    score?: number;                      // Optional overall score for the assessment
    feedback?: string;                   // Optional feedback or comments
    status: string;                      // Status of the assessment ('Completed' by default)
    completed_at: Date;                  // Date and time when the assessment was completed
  }
  