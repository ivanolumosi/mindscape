CREATE PROCEDURE NotifyNewCrisisReported
    @seeker_id INT,
    @counselor_id INT,
    @crisis_id INT
AS
BEGIN
    DECLARE @message NVARCHAR(MAX);
    SET @message = 'A new crisis (ID: ' + CAST(@crisis_id AS NVARCHAR) + ') has been reported by User ' + CAST(@seeker_id AS NVARCHAR) + '.';

    INSERT INTO Notifications (user_id, type, message)
    VALUES (@counselor_id, 'New Crisis Reported', @message);
END;
