CREATE PROCEDURE AddQuestion
    @assessment_title NVARCHAR(255),
    @question_text NVARCHAR(MAX),
    @question_type NVARCHAR(50),
    @options NVARCHAR(MAX),
    @is_required BIT
AS
BEGIN
    INSERT INTO QuestionsAssessment (assessment_title, question_text, question_type, options, is_required, created_at, updated_at)
    VALUES (@assessment_title, @question_text, @question_type, @options, @is_required, GETDATE(), GETDATE());
END;
