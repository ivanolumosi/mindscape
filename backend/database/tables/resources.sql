CREATE TABLE Resources (
    id INT PRIMARY KEY IDENTITY(1,1),           -- Unique identifier for each resource
    title NVARCHAR(255) NOT NULL,                -- Title of the resource (e.g., video, book, event)
    description NVARCHAR(MAX),                   -- Description of the resource
    type NVARCHAR(50) NOT NULL,                  -- Type of the resource: 'video', 'book', 'event', etc.
    url NVARCHAR(255),                           -- URL link to the resource (e.g., YouTube link for video, PDF link for books)
    author NVARCHAR(255),                        -- Author/Creator of the resource (for books or videos)
    date_published DATETIME,                     -- Date when the resource was published
    duration INT,                                -- Duration of the resource (for videos, in minutes; for books, use estimated reading time)
    event_date DATETIME,                         -- Date and time of the event (if the resource is an event)
    created_at DATETIME DEFAULT GETDATE(),       -- Timestamp when the record is created
    updated_at DATETIME DEFAULT GETDATE()        -- Timestamp when the record is last updated
);
