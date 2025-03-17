CREATE PROCEDURE GetUserById
    @id INT
AS
BEGIN
    SELECT * 
    FROM Users
    WHERE id = @id;
END;
