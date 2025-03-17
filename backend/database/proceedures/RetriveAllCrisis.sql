CREATE PROCEDURE GetAllCrises
    @status NVARCHAR(50) = NULL,
    @priority INT = NULL,
    @counselor_id INT = NULL
AS
BEGIN
    SELECT * 
    FROM Crisis
    WHERE (@status IS NULL OR status = @status)
      AND (@priority IS NULL OR priority = @priority)
      AND (@counselor_id IS NULL OR counselor_id = @counselor_id)
    ORDER BY created_at DESC;
END;
