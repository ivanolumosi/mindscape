IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'AddUser')
BEGIN
    DROP PROCEDURE AddUser;
END
GO

CREATE PROCEDURE AddUser
    @name NVARCHAR(100),
    @email NVARCHAR(100),
    @password NVARCHAR(255),
    @role NVARCHAR(50),
    @profile_image NVARCHAR(255) = NULL,
    @specialization NVARCHAR(100) = NULL,
    @faculty NVARCHAR(100) = NULL,
    @privileges NVARCHAR(255) = NULL,
    @availability_schedule NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Basic input validation
        IF @name IS NULL OR LTRIM(RTRIM(@name)) = ''
            THROW 50000, 'Name cannot be empty', 1;
        
        IF @email IS NULL OR LTRIM(RTRIM(@email)) = ''
            THROW 50000, 'Email cannot be empty', 1;

        IF @password IS NULL OR LTRIM(RTRIM(@password)) = ''
            THROW 50000, 'Password cannot be empty', 1;

        IF @role IS NULL OR LTRIM(RTRIM(@role)) = ''
            THROW 50000, 'Role cannot be empty', 1;

        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM Users WHERE email = @email)
            THROW 50000, 'Email already registered', 1;

        -- Insert new user
        INSERT INTO Users (
            name, email, password, role, 
            profile_image, specialization, faculty, privileges, 
            availability_schedule, created_at, updated_at
        )
        VALUES (
            @name, @email, @password, @role, 
            @profile_image, @specialization, @faculty, @privileges, 
            @availability_schedule, GETDATE(), GETDATE()
        );

        -- Return newly created user ID
        SELECT SCOPE_IDENTITY() AS id;
    END TRY
    BEGIN CATCH
        -- Simple re-throw
        THROW;
    END CATCH
END;
GO
