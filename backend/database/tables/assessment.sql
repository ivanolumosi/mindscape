CREATE TABLE Assessment (
    id INT PRIMARY KEY IDENTITY(1,1),                 -- Unique identifier for each assessment
    user_id INT NOT NULL,                              -- ID of the user who took the assessment
    assessment_type NVARCHAR(100) NOT NULL,            -- Type of assessment (e.g., 'Mood Assessment', 'Stress Test', 'Mental Health Quiz')
    assessment_date DATE NOT NULL,                      -- Date when the assessment was taken
    score INT NOT NULL,                                -- Overall score for the assessment
    feedback NVARCHAR(MAX),                            -- Optional feedback or comments from the user
    status NVARCHAR(50) DEFAULT 'Completed',           -- Status of the assessment (e.g., 'Completed', 'In Progress')
    created_at DATETIME DEFAULT GETDATE(),             -- Timestamp when the assessment record was created
    updated_at DATETIME DEFAULT GETDATE(),             -- Timestamp when the record was last updated
    FOREIGN KEY (user_id) REFERENCES Users(id)        -- Relates to the Users table (student)
);


