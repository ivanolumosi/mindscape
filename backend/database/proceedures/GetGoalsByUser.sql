CREATE PROCEDURE GetGoalsByUser
    @UserId INT
AS
BEGIN
    SELECT * 
    FROM Goals
    WHERE user_id = @UserId
    ORDER BY created_at DESC;
END;
