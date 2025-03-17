CREATE PROCEDURE GetMessagesBySenderId
    @sender_id INT
AS
BEGIN
    SELECT cc.id, cc.crisis_id, cc.sender_id, u.name AS sender_name, cc.message, cc.timestamp
    FROM CrisisChat cc
    INNER JOIN Users u ON cc.sender_id = u.id
    WHERE cc.sender_id = @sender_id
    ORDER BY cc.timestamp DESC;
END;
