CREATE PROCEDURE AddGoal
    @UserId INT,
    @GoalTitle NVARCHAR(255),
    @GoalDescription NVARCHAR(MAX),
    @GoalType NVARCHAR(50),
    @DueDate DATETIME
AS
BEGIN
    INSERT INTO Goals (user_id, goal_title, goal_description, goal_type, due_date)
    VALUES (@UserId, @GoalTitle, @GoalDescription, @GoalType, @DueDate);
END;
