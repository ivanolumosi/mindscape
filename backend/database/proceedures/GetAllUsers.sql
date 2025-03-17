CREATE PROCEDURE GetAllUsers
AS
BEGIN
    SELECT * 
    FROM Users
    ORDER BY created_at DESC;
END;
