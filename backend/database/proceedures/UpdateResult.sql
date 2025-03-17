CREATE PROCEDURE UpdateResult
    @id INT,
    @score INT,
    @feedback NVARCHAR(MAX),
    @status NVARCHAR(50)
AS
BEGIN
    UPDATE Results
    SET score = @score,
        feedback = @feedback,
        status = @status,
        completed_at = GETDATE()
    WHERE id = @id;
END;
