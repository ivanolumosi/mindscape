CREATE PROCEDURE DeleteGoal
    @GoalId INT
AS
BEGIN
    DELETE FROM Goals
    WHERE id = @GoalId;
END;
