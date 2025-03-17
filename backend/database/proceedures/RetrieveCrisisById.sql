CREATE PROCEDURE GetCrisisById
    @crisis_id INT
AS
BEGIN
    SELECT * 
    FROM Crisis
    WHERE id = @crisis_id;
END;
