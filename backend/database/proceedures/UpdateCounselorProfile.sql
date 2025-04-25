CREATE PROCEDURE UpdateCounselorProfile
    @UserId INT,
    @Name NVARCHAR(100),
    @Email NVARCHAR(100),
    @ProfileImage NVARCHAR(255),
    @Specialization NVARCHAR(100),
    @AvailabilitySchedule NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET
        name = @Name,
        email = @Email,
        profile_image = @ProfileImage,
        specialization = @Specialization,
        availability_schedule = @AvailabilitySchedule,
        updated_at = GETDATE()
    WHERE
        id = @UserId
        AND role = 'counselor';
END;
GO
CREATE PROCEDURE AutoAddCounselorFriends
    @NewUserId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Insert friendship between new user and every counselor
    INSERT INTO Friends (user_id, friend_id)
    SELECT 
        @NewUserId AS user_id,
        id AS friend_id
    FROM Users
    WHERE role = 'counselor'
      AND id != @NewUserId  -- Avoid self-friendship (just in case)

    UNION ALL

    -- Insert friendship between every counselor and new user (reverse direction)
    SELECT 
        id AS user_id,
        @NewUserId AS friend_id
    FROM Users
    WHERE role = 'counselor'
      AND id != @NewUserId;
END
