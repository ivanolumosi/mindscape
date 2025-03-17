 CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),         -- Unique identifier for each user
    name NVARCHAR(100) NOT NULL,             -- Full name of the user
    email NVARCHAR(100) UNIQUE NOT NULL,     -- Email address (must be unique)
    password NVARCHAR(255) NOT NULL,         -- Encrypted password
    role NVARCHAR(50) NOT NULL,              -- Role: 'admin', 'counselor', 'seeker'
    profile_image NVARCHAR(255),             -- URL to the user's profile picture (only for counselors)
    specialization NVARCHAR(100),            -- For counselors: area of expertise
    faculty NVARCHAR(100),                   -- For seekers: their faculty (if applicable)
    privileges NVARCHAR(255),                -- For admins: list of specific privileges
    availability_schedule NVARCHAR(MAX),     -- For counselors: their schedule (optional)
    created_at DATETIME DEFAULT GETDATE(),   -- Record creation timestamp
    updated_at DATETIME DEFAULT GETDATE()    -- Record last update timestamp
);
ALTER TABLE Users 
ADD 
    email_verified BIT DEFAULT 0,            -- Whether the email is verified (0 = No, 1 = Yes)
    verification_code NVARCHAR(6) NULL,      -- Temporary code for email verification
    verification_expires DATETIME NULL,      -- Expiration time for the verification code
    password_reset_token NVARCHAR(255) NULL, -- Token for password reset
    reset_token_expires DATETIME NULL,       -- Expiration time for reset token
    wants_daily_emails BIT DEFAULT 0;        -- Whether user wants daily email notifications
