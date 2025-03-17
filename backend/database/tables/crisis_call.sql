CREATE TABLE CrisisCall (
    id INT PRIMARY KEY IDENTITY(1,1),                -- Unique identifier for each call
    crisis_id INT NOT NULL,                           -- ID of the associated crisis
    caller_id INT NOT NULL,                           -- ID of the caller (seeker or counselor)
    call_start DATETIME,                              -- Call start time
    call_end DATETIME,                                -- Call end time
    call_duration INT,                                -- Call duration in seconds
    call_type NVARCHAR(50) NOT NULL,                  -- Type of call (e.g., 'Phone', 'Video')
    status NVARCHAR(50) DEFAULT 'Ongoing',            -- Call status ('Ongoing', 'Completed')
    FOREIGN KEY (crisis_id) REFERENCES Crisis(id),    -- Relate to the Crisis table
    FOREIGN KEY (caller_id) REFERENCES Users(id)     -- Relate to the Users table
);
 
