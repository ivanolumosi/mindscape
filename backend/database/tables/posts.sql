CREATE TABLE Posts (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,  -- User who created the post
    content NVARCHAR(MAX) NOT NULL, -- Post content
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) -- Link to Users table
);
