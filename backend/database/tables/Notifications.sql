CREATE TABLE Notifications (
    id INT PRIMARY KEY IDENTITY(1,1),      -- Unique notification ID
    user_id INT NOT NULL,                  -- User receiving the notification
    type NVARCHAR(100) NOT NULL,           -- Type of notification (e.g., 'Friend Request', 'Comment', 'Crisis Report')
    message NVARCHAR(MAX) NOT NULL,        -- Notification content
    is_read BIT DEFAULT 0,                 -- Whether the notification has been read (0 = unread, 1 = read)
    created_at DATETIME DEFAULT GETDATE(), -- Timestamp when the notification was created
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
