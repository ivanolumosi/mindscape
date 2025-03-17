CREATE PROCEDURE GetCounselorsBySpecialization
    @specialization NVARCHAR(100)
AS
BEGIN
    SELECT * 
    FROM Users
    WHERE role = 'counselor' AND specialization = @specialization
    ORDER BY name ASC;
END;
