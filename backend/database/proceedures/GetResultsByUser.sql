CREATE PROCEDURE GetResultsByUser
    @user_id INT
AS
BEGIN
    SELECT * 
    FROM Results
    WHERE user_id = @user_id;
END;
