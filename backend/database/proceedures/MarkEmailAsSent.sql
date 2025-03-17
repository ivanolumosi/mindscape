CREATE PROCEDURE MarkEmailAsSent
    @email_id INT
AS
BEGIN
    UPDATE EmailNotifications 
    SET status = 'Sent', 
        sent_at = GETDATE()
    WHERE id = @email_id;
END;
