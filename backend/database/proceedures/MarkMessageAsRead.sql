CREATE PROCEDURE MarkMessageAsRead
    @message_id INT
AS
BEGIN
    UPDATE DirectMessages
    SET is_read = 1, updated_at = GETDATE()
    WHERE id = @message_id;
END;
