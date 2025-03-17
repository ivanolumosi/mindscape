CREATE PROCEDURE AddResult
    @user_id INT,
    @assessment_title NVARCHAR(255),
    @score INT,
    @feedback NVARCHAR(MAX),
    @status NVARCHAR(50) = 'Completed'  -- Default status
AS
BEGIN
    SET NOCOUNT ON;

    -- Ensure the user exists before inserting the result
    IF NOT EXISTS (SELECT 1 FROM Users WHERE id = @user_id)
    BEGIN
        RAISERROR ('User ID does not exist.', 16, 1);
        RETURN;
    END

    -- Insert result into the Results table
    INSERT INTO Results (user_id, assessment_title, score, feedback, status, completed_at)
    VALUES (@user_id, @assessment_title, @score, @feedback, @status, GETDATE());

    -- Return the inserted row
    SELECT * FROM Results WHERE id = SCOPE_IDENTITY();
END;
