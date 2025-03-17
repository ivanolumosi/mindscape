CREATE PROCEDURE NotifyFriendRequestReceived
    @receiver_id INT
AS
BEGIN
    INSERT INTO Notifications (user_id, type, message)
    VALUES (@receiver_id, 'Friend Request Received', 'You have received a new friend request.');
END;
