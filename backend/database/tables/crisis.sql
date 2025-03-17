CREATE TABLE Crisis (
    id INT PRIMARY KEY IDENTITY(1,1),                -- Unique identifier for each crisis
    seeker_id INT NOT NULL,                           -- ID of the seeker (user in crisis)
    counselor_id INT,                                 -- ID of the assigned counselor (can be NULL until assigned)
    crisis_type NVARCHAR(100) NOT NULL,               -- Type of crisis (e.g., 'Panic Attack', 'Depression', 'Suicidal Thoughts')
    description NVARCHAR(MAX),                        -- A detailed description of the crisis situation
    status NVARCHAR(50) DEFAULT 'Pending',            -- Status of the crisis ('Pending', 'In Progress', 'Resolved')
    priority INT DEFAULT 1,                           -- Crisis priority (1: Low, 2: Medium, 3: High)
    created_at DATETIME DEFAULT GETDATE(),            -- Timestamp when the crisis was reported
    updated_at DATETIME DEFAULT GETDATE(),            -- Timestamp when the record was last updated
    resolved_at DATETIME,                             -- Timestamp when the crisis was resolved (if applicable)
    FOREIGN KEY (seeker_id) REFERENCES Users(id),    -- Relate to the Users table (seekers)
    FOREIGN KEY (counselor_id) REFERENCES Users(id)  -- Relate to the Users table (counselors)
);
