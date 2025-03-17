CREATE PROCEDURE UpdateQuestion
    @id INT,
    @assessment_title NVARCHAR(255),
    @question_text NVARCHAR(MAX),
    @question_type NVARCHAR(50),
    @options NVARCHAR(MAX),
    @is_required BIT
AS
BEGIN
    UPDATE QuestionsAssessment
    SET assessment_title = @assessment_title,
        question_text = @question_text,
        question_type = @question_type,
        options = @options,
        is_required = @is_required,
        updated_at = GETDATE()
    WHERE id = @id;
END;
