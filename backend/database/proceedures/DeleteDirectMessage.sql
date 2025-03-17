CREATE PROCEDURE DeleteDirectMessage
    @message_id INT
AS
BEGIN
    DELETE FROM DirectMessages
    WHERE id = @message_id;
END;
