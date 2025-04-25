CREATE PROCEDURE UpdateUserProfileImage
    @UserId INT,
    @ProfileImage NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET profile_image = @ProfileImage,
        updated_at = GETDATE() -- Update the timestamp
    WHERE id = @UserId;
END
