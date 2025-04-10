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
