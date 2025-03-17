CREATE PROCEDURE SetVerificationCode
    @user_id INT,
    @verification_code NVARCHAR(6),
    @expires_at DATETIME
AS
BEGIN
    UPDATE Users 
    SET verification_code = @verification_code, 
        verification_expires = @expires_at 
    WHERE id = @user_id;
END;
