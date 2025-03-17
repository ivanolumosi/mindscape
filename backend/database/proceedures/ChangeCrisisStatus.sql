DROP PROCEDURE IF EXISTS ChangeCrisisStatus;
GO
CREATE PROCEDURE ChangeCrisisStatus
    @crisis_id INT,
    @status NVARCHAR(50),
    @resolved_at DATETIME = NULL
AS
BEGIN
    UPDATE Crisis
    SET status = @status, 
        updated_at = GETDATE(),
        resolved_at = CASE 
                        WHEN @status = 'Resolved' THEN ISNULL(@resolved_at, GETDATE()) 
                        ELSE NULL 
                      END
    WHERE id = @crisis_id;

    SELECT * FROM Crisis WHERE id = @crisis_id;
END;
GO
