CREATE PROCEDURE UpdateUser
    @id INT,
    @name NVARCHAR(100) = NULL,
    @email NVARCHAR(100) = NULL,
    @password NVARCHAR(255) = NULL,
    @role NVARCHAR(50) = NULL,
    @profile_image NVARCHAR(255) = NULL,
    @specialization NVARCHAR(100) = NULL,
    @faculty NVARCHAR(100) = NULL,
    @privileges NVARCHAR(255) = NULL,
    @availability_schedule NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Users
    SET 
        name = ISNULL(@name, name),
        email = ISNULL(@email, email),
        role = ISNULL(@role, role),
        profile_image = ISNULL(@profile_image, profile_image),
        specialization = ISNULL(@specialization, specialization),
        faculty = ISNULL(@faculty, faculty),
        privileges = ISNULL(@privileges, privileges),
        availability_schedule = ISNULL(@availability_schedule, availability_schedule),
        updated_at = GETDATE()
    WHERE id = @id;

    -- ✅ Only update password if it's provided (avoids overwriting with NULL)
    IF @password IS NOT NULL
    BEGIN
        UPDATE Users
        SET password = @password
        WHERE id = @id;
    END
END;




