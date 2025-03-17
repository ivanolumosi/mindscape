CREATE TABLE Comments (
    id INT PRIMARY KEY IDENTITY(1,1),
    post_id INT NOT NULL,  -- The post the comment belongs to
    user_id INT NOT NULL,  -- User who commented
    content NVARCHAR(MAX) NOT NULL, -- Comment content
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (post_id) REFERENCES Posts(id), -- Link to Posts table
    FOREIGN KEY (user_id) REFERENCES Users(id) -- Link to Users table
);