DROP PROCEDURE IF EXISTS GetAllCrisisCalls;
GO
CREATE PROCEDURE GetAllCrisisCalls
AS
BEGIN
    SELECT 
        cc.id, 
        cc.crisis_id, 
        c.crisis_type, 
        cc.caller_id, 
        u.name AS caller_name, 
        cc.call_start, 
        cc.call_end, 
        cc.call_duration, 
        cc.call_type, 
        cc.status
    FROM CrisisCall cc
    INNER JOIN Crisis c ON cc.crisis_id = c.id
    INNER JOIN Users u ON cc.caller_id = u.id
    ORDER BY cc.call_start DESC;
END;
GO
