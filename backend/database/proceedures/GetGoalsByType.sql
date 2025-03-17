CREATE PROCEDURE GetGoalsByType
    @UserId INT,
    @GoalType NVARCHAR(50)
AS
BEGIN
    SELECT * 
    FROM Goals
    WHERE user_id = @UserId AND goal_type = @GoalType
    ORDER BY created_at DESC;
END;
