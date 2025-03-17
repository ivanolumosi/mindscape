CREATE PROCEDURE NotifyNewChatMessage
    @sender_id INT,
    @receiver_id INT
AS
BEGIN
    DECLARE @message NVARCHAR(MAX);
    SET @message = 'You have received a new chat message from User ' + CAST(@sender_id AS NVARCHAR) + '.';

    INSERT INTO Notifications (user_id, type, message)
    VALUES (@receiver_id, 'New Chat Message', @message);
END;
