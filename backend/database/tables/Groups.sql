CREATE TABLE Groups (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES Users(id)
);

CREATE TABLE GroupMembers (
    id INT PRIMARY KEY IDENTITY(1,1),
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at DATETIME DEFAULT GETDATE(),
    is_admin BIT DEFAULT 0,                        -- Allow admin roles in group
    FOREIGN KEY (group_id) REFERENCES Groups(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
CREATE TABLE GroupMessages (
    id INT PRIMARY KEY IDENTITY(1,1),
    group_id INT NOT NULL,
    sender_id INT NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    content_type NVARCHAR(50) DEFAULT 'text',
    media_url NVARCHAR(255),
    is_read BIT DEFAULT 0,
    is_edited BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (group_id) REFERENCES Groups(id),
    FOREIGN KEY (sender_id) REFERENCES Users(id)
);
