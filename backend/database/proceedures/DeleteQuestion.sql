CREATE PROCEDURE DeleteQuestion
    @id INT
AS
BEGIN
    DELETE FROM QuestionsAssessment WHERE id = @id;
END;
