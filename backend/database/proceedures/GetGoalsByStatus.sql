CREATE PROCEDURE GetGoalsByStatus
    @UserId INT,
    @IsCompleted BIT
AS
BEGIN
    SELECT 
        id, 
        user_id, 
        goal_title, 
        goal_description, 
        goal_type, 
        is_completed, 
        progress_percentage, 
        due_date, 
        created_at, 
        updated_at
    FROM Goals
    WHERE user_id = @UserId AND is_completed = @IsCompleted
    ORDER BY created_at DESC;
END;
