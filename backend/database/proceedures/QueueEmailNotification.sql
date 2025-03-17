CREATE PROCEDURE QueueEmailNotification
    @user_id INT,
    @subject NVARCHAR(255),
    @message NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO EmailNotifications (user_id, subject, message)
    VALUES (@user_id, @subject, @message);
END;
