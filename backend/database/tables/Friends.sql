CREATE TABLE Friends (
    id INT PRIMARY KEY IDENTITY(1,1),        -- Unique identifier for the friendship
    user_id INT NOT NULL,                     -- The ID of the first user
    friend_id INT NOT NULL,                   -- The ID of the second user (friend)
    created_at DATETIME DEFAULT GETDATE(),    -- Timestamp when the friendship was created
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (friend_id) REFERENCES Users(id),
    UNIQUE (user_id, friend_id)               -- Ensures no duplicate friendships
);
