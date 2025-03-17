CREATE PROCEDURE GetResourceById
    @id INT
AS
BEGIN
    SELECT * 
    FROM Resources
    WHERE id = @id;
END;
