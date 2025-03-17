CREATE PROCEDURE GetRecentMessagesByCrisisId
    @crisis_id INT,
    @limit INT
AS
BEGIN
    SELECT TOP (@limit) cc.id, cc.crisis_id, cc.sender_id, u.name AS sender_name, cc.message, cc.timestamp
    FROM CrisisChat cc
    INNER JOIN Users u ON cc.sender_id = u.id
    WHERE cc.crisis_id = @crisis_id
    ORDER BY cc.timestamp DESC;
END;
