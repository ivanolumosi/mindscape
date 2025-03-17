CREATE PROCEDURE GetCommentsByUser
    @user_id INT
AS
BEGIN
    SELECT 
        Comments.id,
        Comments.post_id,
        Posts.content AS PostContent,
        Comments.content AS CommentContent,
        Comments.created_at,
        Comments.updated_at
    FROM Comments
    INNER JOIN Posts ON Comments.post_id = Posts.id
    WHERE Comments.user_id = @user_id
    ORDER BY Comments.created_at DESC; -- Most recent comments first
END;
