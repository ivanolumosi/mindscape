CREATE TABLE CrisisChat (
    id INT PRIMARY KEY IDENTITY(1,1),                 -- Unique identifier for each message
    crisis_id INT NOT NULL,                            -- ID of the associated crisis
    sender_id INT NOT NULL,                            -- ID of the user sending the message (seeker or counselor)
    message NVARCHAR(MAX) NOT NULL,                    -- The content of the message
    timestamp DATETIME DEFAULT GETDATE(),              -- Timestamp of when the message was sent
    FOREIGN KEY (crisis_id) REFERENCES Crisis(id),     -- Relate to the Crisis table
    FOREIGN KEY (sender_id) REFERENCES Users(id)      -- Relate to the Users table
);