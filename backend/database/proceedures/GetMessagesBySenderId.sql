CREATE PROCEDURE GetMessagesBySenderId
    @sender_id INT
AS
BEGIN
    SELECT *
    FROM DirectMessages
    WHERE sender_id = @sender_id
    ORDER BY created_at DESC;
END;
