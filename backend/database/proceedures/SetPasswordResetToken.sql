CREATE PROCEDURE SetPasswordResetToken
    @user_id INT,
    @reset_token NVARCHAR(255),
    @expires_at DATETIME
AS
BEGIN
    UPDATE Users 
    SET password_reset_token = @reset_token, 
        reset_token_expires = @expires_at 
    WHERE id = @user_id;
END;
