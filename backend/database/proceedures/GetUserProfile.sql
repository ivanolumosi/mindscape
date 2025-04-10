CREATE PROCEDURE GetUserProfile
    @UserId INT
AS
BEGIN
    SELECT 
        id,
        name,
        email,
        profile_image,
        faculty,
        role,
        specialization,
        availability_schedule
    FROM Users
    WHERE id = @UserId;
END;
