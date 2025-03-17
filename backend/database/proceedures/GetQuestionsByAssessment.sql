CREATE PROCEDURE GetQuestionsByAssessment
    @assessment_title NVARCHAR(255)
AS
BEGIN
    SELECT * 
    FROM QuestionsAssessment
    WHERE assessment_title = @assessment_title;
END;
