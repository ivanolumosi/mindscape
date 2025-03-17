CREATE PROCEDURE GetGoalById
    @GoalId INT
AS
BEGIN
    SELECT * 
    FROM Goals
    WHERE id = @GoalId;
END;
