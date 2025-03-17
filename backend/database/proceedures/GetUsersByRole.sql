CREATE PROCEDURE GetUsersByRole
    @role NVARCHAR(50)
AS
BEGIN
    SELECT * 
    FROM Users
    WHERE role = @role
    ORDER BY name ASC;
END;
