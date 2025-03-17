CREATE PROCEDURE DeleteUser
    @id INT
AS
BEGIN
    DELETE FROM Users WHERE id = @id;
END;
