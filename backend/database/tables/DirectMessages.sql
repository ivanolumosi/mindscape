-- CREATE TABLE DirectMessages (
--     id INT PRIMARY KEY IDENTITY(1,1),
--     sender_id INT NOT NULL,                     -- User who sent the message
--     receiver_id INT NOT NULL,                   -- User who received the message
--     content NVARCHAR(MAX) NOT NULL,             -- Message content
--     parent_message_id INT NULL,                 -- ID of the parent message (for replies)
--     is_read BIT DEFAULT 0,                      -- Whether the message has been read (0 = unread, 1 = read)
--     created_at DATETIME DEFAULT GETDATE(),      -- Timestamp of when the message was sent
--     updated_at DATETIME DEFAULT GETDATE(),      -- Timestamp when the message was last updated
--     FOREIGN KEY (sender_id) REFERENCES Users(id),    -- Link to Users table (sender)
--     FOREIGN KEY (receiver_id) REFERENCES Users(id),  -- Link to Users table (receiver)
--     FOREIGN KEY (parent_message_id) REFERENCES DirectMessages(id)  -- Link to parent message (if reply)
-- );


--     Alter Posts table to support multiple content types
-- ALTER TABLE Posts
-- ADD content_type NVARCHAR(50) DEFAULT 'text',   -- e.g., 'text', 'image', 'video', 'file'
--     media_url NVARCHAR(255);                    -- If image/video/file, store the media URL

-- -- Alter Comments table similarly
-- ALTER TABLE Comments
-- ADD content_type NVARCHAR(50) DEFAULT 'text',
--     media_url NVARCHAR(255);

-- -- Alter DirectMessages table
-- ALTER TABLE DirectMessages
-- ADD content_type NVARCHAR(50) DEFAULT 'text',
--     media_url NVARCHAR(255),
--     is_edited BIT DEFAULT 0;                    -- Track if a message was edited
