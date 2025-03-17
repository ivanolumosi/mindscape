CREATE PROCEDURE AddUser
    @name NVARCHAR(100),
    @email NVARCHAR(100),
    @password NVARCHAR(255),
    @role NVARCHAR(50),
    @profile_image NVARCHAR(255),
    @specialization NVARCHAR(100),
    @faculty NVARCHAR(100),
    @privileges NVARCHAR(255),
    @availability_schedule NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Users (name, email, password, role, profile_image, specialization, faculty, privileges, availability_schedule, created_at, updated_at)
    VALUES (@name, @email, @password, @role, @profile_image, @specialization, @faculty, @privileges, @availability_schedule, GETDATE(), GETDATE());
END;
