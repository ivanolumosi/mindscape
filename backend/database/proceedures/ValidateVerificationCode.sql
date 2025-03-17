CREATE PROCEDURE ValidateVerificationCode
    @user_id INT,
    @verification_code NVARCHAR(6)
AS
BEGIN
    SELECT id 
    FROM Users 
    WHERE id = @user_id 
      AND verification_code = @verification_code 
      AND verification_expires > GETDATE();
END;
