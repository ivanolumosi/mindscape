CREATE TABLE QuestionsAssessment (
    id INT PRIMARY KEY IDENTITY(1,1),          -- Unique identifier for each question/assessment
    assessment_title NVARCHAR(255) NOT NULL,   -- Title of the assessment
    question_text NVARCHAR(MAX) NOT NULL,      -- Text of the question
    question_type NVARCHAR(50) NOT NULL,       -- Type (e.g., 'Multiple Choice', 'Open Ended')
    options NVARCHAR(MAX),                     -- Comma-separated options for multiple-choice questions
    is_required BIT DEFAULT 1,                 -- Whether the question is mandatory
    created_at DATETIME DEFAULT GETDATE(),     -- When the question/assessment was created
    updated_at DATETIME DEFAULT GETDATE()      -- When it was last updated
);
