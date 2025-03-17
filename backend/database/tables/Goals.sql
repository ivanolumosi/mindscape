CREATE TABLE Goal (
    id INT PRIMARY KEY IDENTITY(1,1),            -- Unique identifier for each goal
    user_id INT NOT NULL,                        -- ID of the user who set the goal
    goal_title NVARCHAR(255) NOT NULL,           -- Title of the goal
    goal_description NVARCHAR(MAX),             -- Detailed description of the goal
    goal_type NVARCHAR(50) NOT NULL,             -- Type of goal: 'Daily', 'Weekly', 'Monthly'
    is_completed BIT DEFAULT 0,                  -- Whether the goal is completed (0 = No, 1 = Yes)
    progress_percentage INT DEFAULT 0,           -- Progress tracking (0 to 100%)
    due_date DATETIME,                           -- Target completion date
    created_at DATETIME DEFAULT GETDATE(),       -- When the goal was created
    updated_at DATETIME DEFAULT GETDATE(),       -- Last updated timestamp
    FOREIGN KEY (user_id) REFERENCES Users(id)   -- Relates to the Users table
);
