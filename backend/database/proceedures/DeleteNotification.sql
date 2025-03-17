CREATE PROCEDURE DeleteNotification
    @notification_id INT
AS
BEGIN
    DELETE FROM Notifications WHERE id = @notification_id;
END;
