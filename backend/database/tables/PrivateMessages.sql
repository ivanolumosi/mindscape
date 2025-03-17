CREATE TABLE PrivateMessages (
    id INT PRIMARY KEY IDENTITY(1,1),         -- Unique identifier for each message
    sender_id INT NOT NULL,                    -- ID of the user sending the message
    receiver_id INT NOT NULL,                  -- ID of the user receiving the message
    content NVARCHAR(MAX) NOT NULL,            -- Message content
    is_read BIT DEFAULT 0,                     -- Whether the message has been read (0 = unread, 1 = read)
    created_at DATETIME DEFAULT GETDATE(),     -- Timestamp of when the message was sent
    FOREIGN KEY (sender_id) REFERENCES Users(id), -- Relates to Users table (sender)
    FOREIGN KEY (receiver_id) REFERENCES Users(id) -- Relates to Users table (receiver)
);

DROP TABLE PrivateMessages;