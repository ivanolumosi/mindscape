CREATE PROCEDURE GetMessagesByCrisisId
    @crisis_id INT
AS
BEGIN
    SELECT cc.id, cc.crisis_id, cc.sender_id, u.name AS sender_name, cc.message, cc.timestamp
    FROM CrisisChat cc
    INNER JOIN Users u ON cc.sender_id = u.id
    WHERE cc.crisis_id = @crisis_id
    ORDER BY cc.timestamp ASC;
END;
