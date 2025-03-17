CREATE PROCEDURE GetCommentByID
    @comment_id INT
AS
BEGIN
    SELECT 
        Comments.id,
        Comments.post_id,
        Posts.content AS PostContent,
        Comments.user_id,
        Users.firstName + ' ' + Users.lastName AS UserName,
        Comments.content AS CommentContent,
        Comments.created_at,
        Comments.updated_at
    FROM Comments
    INNER JOIN Posts ON Comments.post_id = Posts.id
    INNER JOIN Users ON Comments.user_id = Users.id
    WHERE Comments.id = @comment_id;
END;
