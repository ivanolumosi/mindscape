CREATE PROCEDURE GetResponsesByUserAndAssessment
    @user_id INT,
    @assessment_title NVARCHAR(255)
AS
BEGIN
    SELECT r.*, q.assessment_title
    FROM Responses r
    INNER JOIN QuestionsAssessment q ON r.question_id = q.id
    WHERE r.user_id = @user_id AND q.assessment_title = @assessment_title;
END;
