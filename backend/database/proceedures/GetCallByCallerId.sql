CREATE PROCEDURE GetCallsByCallerId
    @caller_id INT
AS
BEGIN
    SELECT * 
    FROM CrisisCall
    WHERE caller_id = @caller_id
    ORDER BY call_start DESC;
END;
