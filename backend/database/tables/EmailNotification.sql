CREATE TABLE EmailNotifications (
    id INT PRIMARY KEY IDENTITY(1,1), -- Unique identifier
    user_id INT NOT NULL,              -- Reference to Users table
    subject NVARCHAR(255) NOT NULL,    -- Email subject
    message NVARCHAR(MAX) NOT NULL,    -- Email content
    status NVARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Sent', 'Failed'
    created_at DATETIME DEFAULT GETDATE(), -- When the email was queued
    sent_at DATETIME NULL, -- Timestamp when the email was sent
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
