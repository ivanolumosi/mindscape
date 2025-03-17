CREATE PROCEDURE GetAllUserNotifications
    @user_id INT
AS
BEGIN
    SELECT * FROM Notifications WHERE user_id = @user_id ORDER BY created_at DESC;
END;
