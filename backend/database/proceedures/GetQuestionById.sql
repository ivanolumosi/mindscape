CREATE PROCEDURE GetQuestionById
    @id INT
AS
BEGIN
    SELECT *
    FROM QuestionsAssessment
    WHERE id = @id;
END;
