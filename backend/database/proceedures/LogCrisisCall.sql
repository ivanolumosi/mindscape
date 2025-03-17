CREATE PROCEDURE LogCrisisCall
    @crisis_id INT,
    @caller_id INT,
    @call_start DATETIME,
    @call_type NVARCHAR(50)
AS
BEGIN
    INSERT INTO CrisisCall (crisis_id, caller_id, call_start, call_type)
    VALUES (@crisis_id, @caller_id, @call_start, @call_type);
    
    SELECT SCOPE_IDENTITY() AS NewCallID;
END;
