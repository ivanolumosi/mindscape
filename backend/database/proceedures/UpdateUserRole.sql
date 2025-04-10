CREATE PROCEDURE UpdateUserRole
    @UserId INT,
    @NewRole NVARCHAR(50)
AS
BEGIN
    UPDATE Users
    SET role = @NewRole,
        updated_at = GETDATE()
    WHERE id = @UserId;
END;
