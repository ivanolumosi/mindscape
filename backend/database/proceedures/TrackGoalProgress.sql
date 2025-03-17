CREATE PROCEDURE TrackGoalProgress
    @GoalId INT
AS
BEGIN
    SELECT progress_percentage, is_completed
    FROM Goals
    WHERE id = @GoalId;
END;
