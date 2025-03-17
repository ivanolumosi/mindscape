CREATE TABLE FriendRequests (
    id INT PRIMARY KEY IDENTITY(1,1),         -- Unique identifier for the request
    sender_id INT NOT NULL,                    -- The user sending the friend request
    receiver_id INT NOT NULL,                  -- The user receiving the friend request
    status NVARCHAR(50) DEFAULT 'Pending',    -- Request status ('Pending', 'Accepted', 'Rejected')
    created_at DATETIME DEFAULT GETDATE(),     -- Timestamp when the request was sent
    FOREIGN KEY (sender_id) REFERENCES Users(id),
    FOREIGN KEY (receiver_id) REFERENCES Users(id),
    UNIQUE (sender_id, receiver_id)            -- Ensures no duplicate requests
);
