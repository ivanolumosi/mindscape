CREATE PROCEDURE AddComment
    @post_id INT,
    @user_id INT,
    @content NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Comments (post_id, user_id, content, created_at, updated_at)
    VALUES (@post_id, @user_id, @content, GETDATE(), GETDATE());

    SELECT SCOPE_IDENTITY() AS NewCommentID; -- Return the ID of the newly created comment
END;
