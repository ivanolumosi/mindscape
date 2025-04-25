-- ================================================
-- View all seekers and their details
-- ================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_ViewSeekers')
    DROP PROCEDURE sp_Counselor_ViewSeekers;
GO
CREATE PROCEDURE sp_Counselor_ViewSeekers
AS
BEGIN
    SELECT id, name, email, faculty, created_at, updated_at
    FROM Users
    WHERE role = 'seeker';
END;
GO

-- ================================================
-- Create a new seeker
-- ================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_CreateSeeker')
    DROP PROCEDURE sp_Counselor_CreateSeeker;
GO
CREATE PROCEDURE sp_Counselor_CreateSeeker
    @Name NVARCHAR(100),
    @Email NVARCHAR(100),
    @Password NVARCHAR(255),
    @Faculty NVARCHAR(100)
AS
BEGIN
    INSERT INTO Users (name, email, password, role, faculty)
    VALUES (@Name, @Email, @Password, 'seeker', @Faculty);
END;
GO

-- ================================================
-- Update a seeker’s details
-- ================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_UpdateSeeker')
    DROP PROCEDURE sp_Counselor_UpdateSeeker;
GO
CREATE PROCEDURE sp_Counselor_UpdateSeeker
    @SeekerID INT,
    @Name NVARCHAR(100),
    @Email NVARCHAR(100),
    @Faculty NVARCHAR(100)
AS
BEGIN
    UPDATE Users
    SET name = @Name,
        email = @Email,
        faculty = @Faculty,
        updated_at = GETDATE()
    WHERE id = @SeekerID AND role = 'seeker';
END;
GO

-- ================================================
-- Delete a seeker
-- ================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_DeleteSeeker')
    DROP PROCEDURE sp_Counselor_DeleteSeeker;
GO
CREATE PROCEDURE sp_Counselor_DeleteSeeker
    @SeekerID INT
AS
BEGIN
    DELETE FROM Users
    WHERE id = @SeekerID AND role = 'seeker';
END;
GO

-- ================================================
-- Send a message to a seeker
-- ================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_SendMessage')
    DROP PROCEDURE sp_Counselor_SendMessage;
GO
CREATE PROCEDURE sp_Counselor_SendMessage
    @SenderID INT,
    @ReceiverID INT,
    @Content NVARCHAR(MAX),
    @ParentMessageID INT = NULL
AS
BEGIN
    INSERT INTO DirectMessages (sender_id, receiver_id, content, parent_message_id)
    VALUES (@SenderID, @ReceiverID, @Content, @ParentMessageID);
END;
GO

-- ================================================
-- View all messages between counselor and a specific seeker
-- ================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_ViewMessages')
    DROP PROCEDURE sp_Counselor_ViewMessages;
GO
CREATE PROCEDURE sp_Counselor_ViewMessages
    @CounselorID INT,
    @SeekerID INT
AS
BEGIN
    SELECT *
    FROM DirectMessages
    WHERE 
        (sender_id = @CounselorID AND receiver_id = @SeekerID)
        OR
        (sender_id = @SeekerID AND receiver_id = @CounselorID)
    ORDER BY created_at;
END;
GO

-- ================================================
-- Mark a message as read
-- ================================================
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_MarkMessageRead')
    DROP PROCEDURE sp_Counselor_MarkMessageRead;
GO
CREATE PROCEDURE sp_Counselor_MarkMessageRead
    @MessageID INT
AS
BEGIN
    UPDATE DirectMessages
    SET is_read = 1
    WHERE id = @MessageID;
END;
GO


IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_AddOrUpdateAvailability')
    DROP PROCEDURE sp_Counselor_AddOrUpdateAvailability;
GO
CREATE PROCEDURE sp_Counselor_AddOrUpdateAvailability
    @CounselorID INT,
    @Day NVARCHAR(20),
    @StartTime TIME,
    @EndTime TIME
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM CounselorAvailability 
        WHERE counselor_id = @CounselorID AND available_day = @Day
    )
    BEGIN
        UPDATE CounselorAvailability
        SET start_time = @StartTime,
            end_time = @EndTime,
            updated_at = GETDATE()
        WHERE counselor_id = @CounselorID AND available_day = @Day;
    END
    ELSE
    BEGIN
        INSERT INTO CounselorAvailability (counselor_id, available_day, start_time, end_time)
        VALUES (@CounselorID, @Day, @StartTime, @EndTime);
    END
END;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_ScheduleSession')
    DROP PROCEDURE sp_Counselor_ScheduleSession;
GO
CREATE PROCEDURE sp_Counselor_ScheduleSession
    @CounselorID INT,
    @Title NVARCHAR(100),
    @Venue NVARCHAR(255),
    @Date DATE,
    @StartTime TIME,
    @EndTime TIME,
    @Description NVARCHAR(MAX),
    @MaxParticipants INT = 1
AS
BEGIN
    -- Check availability on that day
    DECLARE @DayName NVARCHAR(20) = DATENAME(WEEKDAY, @Date);
    
    IF NOT EXISTS (
        SELECT 1 FROM CounselorAvailability
        WHERE 
            counselor_id = @CounselorID 
            AND available_day = @DayName
            AND start_time <= @StartTime 
            AND end_time >= @EndTime
    )
    BEGIN
        RAISERROR('Counselor not available at that time.', 16, 1);
        RETURN;
    END

    -- Optional: Prevent double-booking
    IF EXISTS (
        SELECT 1 FROM Sessions 
        WHERE counselor_id = @CounselorID AND session_date = @Date 
        AND ((@StartTime BETWEEN start_time AND end_time) OR (@EndTime BETWEEN start_time AND end_time))
    )
    BEGIN
        RAISERROR('Counselor already has a session during that time.', 16, 1);
        RETURN;
    END

    INSERT INTO Sessions (
        counselor_id, session_title, venue, session_date, start_time, end_time, description, max_participants
    )
    VALUES (
        @CounselorID, @Title, @Venue, @Date, @StartTime, @EndTime, @Description, @MaxParticipants
    );
END;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_ViewSessions')
    DROP PROCEDURE sp_Counselor_ViewSessions;
GO
CREATE PROCEDURE sp_Counselor_ViewSessions
    @CounselorID INT
AS
BEGIN
    SELECT *
    FROM Sessions
    WHERE counselor_id = @CounselorID
    ORDER BY session_date, start_time;
END;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_CancelSession')
    DROP PROCEDURE sp_Counselor_CancelSession;
GO
CREATE PROCEDURE sp_Counselor_CancelSession
    @SessionID INT,
    @CounselorID INT
AS
BEGIN
    DELETE FROM Sessions
    WHERE id = @SessionID AND counselor_id = @CounselorID;
END;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_WeeklyTimetable')
    DROP PROCEDURE sp_Counselor_WeeklyTimetable;
GO
CREATE PROCEDURE sp_Counselor_WeeklyTimetable
    @CounselorID INT
AS
BEGIN
    SELECT 
        ca.available_day,
        ca.start_time,
        ca.end_time,
        s.session_title,
        s.session_date,
        s.start_time AS session_start,
        s.end_time AS session_end,
        s.venue
    FROM CounselorAvailability ca
    LEFT JOIN Sessions s ON ca.counselor_id = s.counselor_id 
        AND DATENAME(WEEKDAY, s.session_date) = ca.available_day
    WHERE ca.counselor_id = @CounselorID
    ORDER BY 
        ca.available_day,
        ca.start_time;
END;
GO
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_Counselor_CheckSlotAvailability')
    DROP PROCEDURE sp_Counselor_CheckSlotAvailability;
GO
CREATE PROCEDURE sp_Counselor_CheckSlotAvailability
    @CounselorID INT,
    @Date DATE,
    @StartTime TIME,
    @EndTime TIME
AS
BEGIN
    DECLARE @DayName NVARCHAR(20) = DATENAME(WEEKDAY, @Date);

    IF EXISTS (
        SELECT 1 FROM CounselorAvailability
        WHERE counselor_id = @CounselorID
        AND available_day = @DayName
        AND start_time <= @StartTime AND end_time >= @EndTime
    )
    BEGIN
        PRINT 'Counselor is available.';
    END
    ELSE
    BEGIN
        PRINT 'Counselor is not available during that slot.';
    END
END;
GO
