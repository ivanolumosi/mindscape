CREATE PROCEDURE GetAssessmentsByTitle
    @assessment_title NVARCHAR(255)
AS
BEGIN
    SELECT DISTINCT assessment_title
    FROM QuestionsAssessment
    WHERE assessment_title LIKE '%' + @assessment_title + '%'
    ORDER BY assessment_title;
END;
