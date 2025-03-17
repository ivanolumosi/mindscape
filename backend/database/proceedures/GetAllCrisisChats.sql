DROP PROCEDURE IF EXISTS GetAllCrisisChats;
GO
CREATE PROCEDURE GetAllCrisisChats
AS
BEGIN
    SELECT 
        cc.id, 
        cc.crisis_id, 
        c.crisis_type, 
        cc.sender_id, 
        u.name AS sender_name, 
        cc.message, 
        cc.timestamp
    FROM CrisisChat cc
    INNER JOIN Crisis c ON cc.crisis_id = c.id
    INNER JOIN Users u ON cc.sender_id = u.id
    ORDER BY cc.timestamp DESC;
END;
GO
