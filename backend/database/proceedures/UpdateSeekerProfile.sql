CREATE PROCEDURE UpdateSeekerProfile
    @UserId INT,
    @Name NVARCHAR(100),
    @Email NVARCHAR(100),
    @Faculty NVARCHAR(100),
    @WantsDailyEmails BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET
        name = @Name,
        email = @Email,
        faculty = @Faculty,
        wants_daily_emails = @WantsDailyEmails,
        updated_at = GETDATE()
    WHERE
        id = @UserId
        AND role = 'seeker';
END;
GO
