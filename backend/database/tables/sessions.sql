CREATE TABLE Sessions (
    id INT PRIMARY KEY IDENTITY(1,1),
    counselor_id INT NOT NULL,
    session_title NVARCHAR(100) NOT NULL,
    venue NVARCHAR(255) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_participants INT DEFAULT 1,
    description NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (counselor_id) REFERENCES Users(id)
);
GO

-- Now add duration as a computed column
ALTER TABLE Sessions
ADD duration_minutes AS DATEDIFF(MINUTE, start_time, end_time) PERSISTED;
GO

CREATE TABLE CounselorAvailability (
    id INT PRIMARY KEY IDENTITY(1,1),
    counselor_id INT NOT NULL,
    available_day NVARCHAR(20), -- e.g. Monday, Tuesday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (counselor_id) REFERENCES Users(id)
);
