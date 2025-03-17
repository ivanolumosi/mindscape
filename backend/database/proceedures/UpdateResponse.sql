CREATE PROCEDURE UpdateResponse
    @id INT,
    @response_text NVARCHAR(MAX),
    @selected_option NVARCHAR(MAX)
AS
BEGIN
    UPDATE Responses
    SET response_text = @response_text,
        selected_option = @selected_option,
        submitted_at = GETDATE()
    WHERE id = @id;
END;
