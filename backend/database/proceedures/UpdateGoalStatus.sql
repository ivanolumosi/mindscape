CREATE PROCEDURE UpdateGoalStatus
    @GoalId INT,
    @IsCompleted BIT,
    @ProgressPercentage INT
AS
BEGIN
    UPDATE Goals
    SET is_completed = @IsCompleted,
        progress_percentage = @ProgressPercentage,
        updated_at = GETDATE()
    WHERE id = @GoalId;
END;
