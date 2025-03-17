CREATE PROCEDURE VerifyUserEmail
    @user_id INT
AS
BEGIN
    UPDATE Users 
    SET email_verified = 1, 
        verification_code = NULL, 
        verification_expires = NULL 
    WHERE id = @user_id;
END;
