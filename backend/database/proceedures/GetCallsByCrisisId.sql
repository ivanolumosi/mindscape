CREATE PROCEDURE GetCallsByCrisisId
    @crisis_id INT
AS
BEGIN
    SELECT * 
    FROM CrisisCall
    WHERE crisis_id = @crisis_id
    ORDER BY call_start DESC;
END;
