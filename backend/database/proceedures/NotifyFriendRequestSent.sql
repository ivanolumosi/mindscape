CREATE PROCEDURE NotifyFriendRequestSent
    @sender_id INT,
    @receiver_id INT
AS
BEGIN
    DECLARE @message NVARCHAR(MAX);
    SET @message = 'User ' + CAST(@sender_id AS NVARCHAR) + ' sent you a friend request.';

    INSERT INTO Notifications (user_id, type, message)
    VALUES (@receiver_id, 'Friend Request Sent', @message);
END;
