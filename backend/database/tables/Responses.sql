CREATE TABLE Responses (
    id INT PRIMARY KEY IDENTITY(1,1),          -- Unique identifier for each response
    user_id INT NOT NULL,                      -- Foreign key to Users table
    question_id INT NOT NULL,                  -- Foreign key to QuestionsAssessment table
    response_text NVARCHAR(MAX),               -- User's response (for open-ended questions)
    selected_option NVARCHAR(MAX),             -- User's selected option (for multiple-choice)
    submitted_at DATETIME DEFAULT GETDATE(),   -- When the response was submitted
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES QuestionsAssessment(id) ON DELETE CASCADE
);
