CREATE PROCEDURE GetAllQuestions
AS
BEGIN
    SELECT *
    FROM QuestionsAssessment
    ORDER BY created_at DESC;
END;
