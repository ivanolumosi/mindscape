CREATE TABLE Results (
    id INT PRIMARY KEY IDENTITY(1,1),          -- Unique identifier for each result
    user_id INT NOT NULL,                      -- Foreign key to Users table
    assessment_title NVARCHAR(255) NOT NULL,   -- Title of the assessment
    score INT,                                 -- Overall score (if applicable)
    feedback NVARCHAR(MAX),                    -- Optional feedback or comments
    status NVARCHAR(50) DEFAULT 'Completed',   -- Status of the assessment
    completed_at DATETIME DEFAULT GETDATE(),   -- When the assessment was completed
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
