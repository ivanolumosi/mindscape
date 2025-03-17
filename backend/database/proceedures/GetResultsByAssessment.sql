CREATE PROCEDURE GetResultsByAssessment
    @assessment_title NVARCHAR(255)
AS
BEGIN
    SELECT *
    FROM Results
    WHERE assessment_title = @assessment_title;
END;
