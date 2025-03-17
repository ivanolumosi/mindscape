CREATE TABLE DailyJournal (
    id INT PRIMARY KEY IDENTITY(1,1),               -- Unique identifier for each journal entry
    user_id INT NOT NULL,                            -- ID of the user (student) who created the journal entry
    entry_date DATE NOT NULL,                        -- The date of the journal entry
    mood NVARCHAR(50),                               -- The mood of the user (e.g., 'Happy', 'Sad', 'Anxious')
    reflections NVARCHAR(MAX),                       -- A detailed reflection or description of the user's day
    gratitude NVARCHAR(MAX),                         -- What the user is grateful for on that day
    created_at DATETIME DEFAULT GETDATE(),           -- Timestamp when the entry is created
    updated_at DATETIME DEFAULT GETDATE(),           -- Timestamp when the entry is last updated
    FOREIGN KEY (user_id) REFERENCES Users(id)      -- Relates to the Users table (student)
);
