DROP PROCEDURE IF EXISTS GetAllCrisisChatsByUser;
GO
CREATE PROCEDURE GetAllCrisisChatsByUser
    @user_id INT
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
    WHERE cc.sender_id = @user_id
    ORDER BY cc.timestamp DESC;
END;
GO
