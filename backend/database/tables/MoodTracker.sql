CREATE TABLE MoodTracker (
    id INT PRIMARY KEY IDENTITY(1,1),         -- Unique identifier for each mood entry
    user_id INT NOT NULL,                      -- User who is recording the mood (references Users table)
    mood NVARCHAR(50) NOT NULL,                -- Mood value (e.g., "happy", "sad", "anxious", etc.)
    notes NVARCHAR(500),                       -- Optional field for additional notes or thoughts
    recorded_at DATETIME DEFAULT GETDATE(),   -- Timestamp for when the mood was recorded
    FOREIGN KEY (user_id) REFERENCES Users(id) -- Foreign key linking to Users table
);
