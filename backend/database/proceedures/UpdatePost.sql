CREATE PROCEDURE UpdatePost
    @post_id INT,
    @content NVARCHAR(MAX)
AS
BEGIN
    UPDATE Posts
    SET content = @content,
        updated_at = GETDATE()
    WHERE id = @post_id;

    SELECT * FROM Posts WHERE id = @post_id; -- Return the updated post
END;
