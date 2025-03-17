CREATE PROCEDURE DeleteComment
    @comment_id INT
AS
BEGIN
    DELETE FROM Comments
    WHERE id = @comment_id;

    SELECT 'Comment deleted successfully' AS Message;
END;
