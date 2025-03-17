CREATE PROCEDURE GetFriendRequestNotifications
    @user_id INT
AS
BEGIN
    SELECT * FROM Notifications WHERE user_id = @user_id AND type = 'Friend Request Received' ORDER BY created_at DESC;
END;
