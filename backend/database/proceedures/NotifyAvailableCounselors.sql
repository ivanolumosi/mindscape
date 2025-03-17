CREATE PROCEDURE NotifyAvailableCounselors
    @crisis_id INT
AS
BEGIN
    INSERT INTO Notifications (user_id, type, message)
    SELECT id, 'Crisis Alert', 'A new crisis (ID: ' + CAST(@crisis_id AS NVARCHAR) + ') needs your attention.'
    FROM Users WHERE role = 'counselor';
END;
