CREATE TABLE DirectMessages (
    id INT PRIMARY KEY IDENTITY(1,1),
    sender_id INT NOT NULL,                     -- User who sent the message
    receiver_id INT NOT NULL,                   -- User who received the message
    content NVARCHAR(MAX) NOT NULL,             -- Message content
    parent_message_id INT NULL,                 -- ID of the parent message (for replies)
    is_read BIT DEFAULT 0,                      -- Whether the message has been read (0 = unread, 1 = read)
    created_at DATETIME DEFAULT GETDATE(),      -- Timestamp of when the message was sent
    updated_at DATETIME DEFAULT GETDATE(),      -- Timestamp when the message was last updated
    FOREIGN KEY (sender_id) REFERENCES Users(id),    -- Link to Users table (sender)
    FOREIGN KEY (receiver_id) REFERENCES Users(id),  -- Link to Users table (receiver)
    FOREIGN KEY (parent_message_id) REFERENCES DirectMessages(id)  -- Link to parent message (if reply)
);
