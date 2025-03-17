CREATE PROCEDURE GetUnreadMessages
    @receiver_id INT
AS
BEGIN
    SELECT id, sender_id, content, created_at
    FROM DirectMessages
    WHERE receiver_id = @receiver_id AND is_read = 0
    ORDER BY created_at ASC;
END;
