CREATE TRIGGER trg_NotifyFriendRequest
ON FriendRequests
AFTER INSERT
AS
BEGIN
    DECLARE @sender_id INT, @receiver_id INT;
    SELECT @sender_id = sender_id, @receiver_id = receiver_id FROM inserted;

    EXEC NotifyFriendRequestSent @sender_id, @receiver_id;
    EXEC NotifyFriendRequestReceived @receiver_id;
END;
