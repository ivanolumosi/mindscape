DROP PROCEDURE IF EXISTS UpdateNotificationPreference;
GO
CREATE PROCEDURE UpdateNotificationPreference
    @user_id INT,
    @wants_daily_emails BIT
AS
BEGIN
    UPDATE Users 
    SET wants_daily_emails = @wants_daily_emails
    WHERE id = @user_id;
END;
GO
