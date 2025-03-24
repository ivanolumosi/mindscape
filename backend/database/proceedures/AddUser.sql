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


IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'AddUser')
BEGIN
    DROP PROCEDURE AddUser
END
GO
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'AddUser')
BEGIN
    DROP PROCEDURE AddUser
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
    -- Declare variables for error handling
    DECLARE @ErrorMessage NVARCHAR(4000);
    DECLARE @ErrorSeverity INT;
    DECLARE @ErrorState INT;
    DECLARE @UserID INT;

    -- Begin a transaction
    BEGIN TRANSACTION;

    BEGIN TRY
        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM Users WHERE email = @email)
        BEGIN
            RAISERROR('Email already registered', 16, 1);
            RETURN;
        END

        -- Validate input
        IF @name IS NULL OR LTRIM(RTRIM(@name)) = ''
        BEGIN
            RAISERROR('Name cannot be empty', 16, 1);
            RETURN;
        END

        IF @email IS NULL OR LTRIM(RTRIM(@email)) = ''
        BEGIN
            RAISERROR('Email cannot be empty', 16, 1);
            RETURN;
        END

        IF @password IS NULL OR LTRIM(RTRIM(@password)) = ''
        BEGIN
            RAISERROR('Password cannot be empty', 16, 1);
            RETURN;
        END

        IF @role IS NULL OR LTRIM(RTRIM(@role)) = ''
        BEGIN
            RAISERROR('Role cannot be empty', 16, 1);
            RETURN;
        END

        -- Insert the new user
        INSERT INTO Users (
            name, 
            email, 
            password, 
            role, 
            profile_image, 
            specialization, 
            faculty, 
            privileges, 
            availability_schedule, 
            created_at, 
            updated_at
        )
        VALUES (
            @name, 
            @email, 
            @password, 
            @role, 
            @profile_image, 
            @specialization, 
            @faculty, 
            @privileges, 
            @availability_schedule, 
            GETDATE(), 
            GETDATE()
        );

        -- Get the newly inserted user's ID
        SET @UserID = SCOPE_IDENTITY();

        -- Commit the transaction
        COMMIT TRANSACTION;

        -- Return the new user's ID
        SELECT @UserID AS id;
    END TRY
    BEGIN CATCH
        -- Rollback the transaction
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Capture error information
        DECLARE @DetailedError NVARCHAR(4000) = 
            'Error Number: ' + CAST(ERROR_NUMBER() AS NVARCHAR(10)) + 
            ', Error Severity: ' + CAST(ERROR_SEVERITY() AS NVARCHAR(10)) + 
            ', Error State: ' + CAST(ERROR_STATE() AS NVARCHAR(10)) + 
            ', Error Procedure: ' + ISNULL(ERROR_PROCEDURE(), 'N/A') + 
            ', Error Line: ' + CAST(ERROR_LINE() AS NVARCHAR(10)) + 
            ', Error Message: ' + ERROR_MESSAGE();

        -- Log the error (you might want to replace this with your actual error logging mechanism)
        INSERT INTO ErrorLog (
            ErrorNumber, 
            ErrorSeverity, 
            ErrorState, 
            ErrorProcedure, 
            ErrorLine, 
            ErrorMessage, 
            ErrorDateTime
        )
        VALUES (
            ERROR_NUMBER(),
            ERROR_SEVERITY(),
            ERROR_STATE(),
            ERROR_PROCEDURE(),
            ERROR_LINE(),
            @DetailedError,
            GETDATE()
        );

        -- Re-raise the error
        RAISERROR(@DetailedError, 16, 1);
    END CATCH
END;
GO