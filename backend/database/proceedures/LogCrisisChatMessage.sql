CREATE PROCEDURE LogCrisisChatMessage
    @crisis_id INT,
    @sender_id INT,
    @message NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO CrisisChat (crisis_id, sender_id, message)
    VALUES (@crisis_id, @sender_id, @message);

    SELECT SCOPE_IDENTITY() AS NewMessageID;
END;
