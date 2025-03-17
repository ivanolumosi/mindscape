CREATE PROCEDURE DeleteResource
    @id INT
AS
BEGIN
    DELETE FROM Resources WHERE id = @id;
END;
