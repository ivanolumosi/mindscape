CREATE PROCEDURE ReplyToDirectMessage
    @sender_id INT,
    @receiver_id INT,
    @content NVARCHAR(MAX),
    @parent_message_id INT
AS
BEGIN
    INSERT INTO DirectMessages (sender_id, receiver_id, content, parent_message_id, is_read, created_at, updated_at)
    VALUES (@sender_id, @receiver_id, @content, @parent_message_id, 0, GETDATE(), GETDATE());
END;
