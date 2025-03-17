CREATE PROCEDURE DeletePost
    @post_id INT
AS
BEGIN
    DELETE FROM Posts
    WHERE id = @post_id;

    SELECT 'Post deleted successfully' AS Message;
END;
