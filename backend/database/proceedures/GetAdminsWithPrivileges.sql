CREATE PROCEDURE GetAdminsWithPrivileges
    @privileges NVARCHAR(255)
AS
BEGIN
    SELECT * 
    FROM Users
    WHERE role = 'admin' AND privileges LIKE '%' + @privileges + '%'
    ORDER BY name ASC;
END;
