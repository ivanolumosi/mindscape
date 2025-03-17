CREATE PROCEDURE UpdateComment
    @comment_id INT,
    @content NVARCHAR(MAX)
AS
BEGIN
    UPDATE Comments
    SET content = @content,
        updated_at = GETDATE()
    WHERE id = @comment_id;

    SELECT * FROM Comments WHERE id = @comment_id; -- Return the updated comment
END;
