CREATE PROCEDURE UpdateUserProfile
    @UserId INT,
    @Name NVARCHAR(100),
    @Email NVARCHAR(100),
    @Password NVARCHAR(255),
    @ProfileImage NVARCHAR(255),
    @Faculty NVARCHAR(100),
    @Specialization NVARCHAR(100) = NULL,
    @AvailabilitySchedule NVARCHAR(MAX) = NULL
AS
BEGIN
    DECLARE @UserRole NVARCHAR(50);

    SELECT @UserRole = role FROM Users WHERE id = @UserId;

    IF @UserRole IS NULL
    BEGIN
        RAISERROR('User not found.', 16, 1);
        RETURN;
    END

    -- Seekers: update only basic info
    IF @UserRole = 'seeker'
    BEGIN
        UPDATE Users
        SET 
            name = @Name,
            email = @Email,
            password = @Password,
            profile_image = @ProfileImage,
            faculty = @Faculty,
            updated_at = GETDATE()
        WHERE id = @UserId;
    END

    -- Counselors: update more fields (profile image required)
    ELSE IF @UserRole = 'counselor'
    BEGIN
        IF @ProfileImage IS NULL OR LTRIM(RTRIM(@ProfileImage)) = ''
        BEGIN
            RAISERROR('Profile image is required for counselors.', 16, 1);
            RETURN;
        END

        UPDATE Users
        SET 
            name = @Name,
            email = @Email,
            password = @Password,
            profile_image = @ProfileImage,
            specialization = @Specialization,
            availability_schedule = @AvailabilitySchedule,
            updated_at = GETDATE()
        WHERE id = @UserId;
    END
END;
