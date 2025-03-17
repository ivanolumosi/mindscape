CREATE PROCEDURE DeleteCrisisCall
    @call_id INT
AS
BEGIN
    DELETE FROM CrisisCall
    WHERE id = @call_id;
END;
