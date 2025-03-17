CREATE PROCEDURE GetUsersByFaculty
    @faculty NVARCHAR(100)
AS
BEGIN
    SELECT * 
    FROM Users
    WHERE role = 'seeker' AND faculty = @faculty
    ORDER BY name ASC;
END;
