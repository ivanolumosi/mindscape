CREATE PROCEDURE UpdateCrisisCallStatus
    @call_id INT,
    @status NVARCHAR(50),
    @call_end DATETIME = NULL
AS
BEGIN
    UPDATE CrisisCall
    SET status = @status,
        call_end = @call_end,
        call_duration = DATEDIFF(SECOND, call_start, @call_end)
    WHERE id = @call_id;

    SELECT * FROM CrisisCall WHERE id = @call_id;
END;
