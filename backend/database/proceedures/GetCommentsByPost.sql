CREATE PROCEDURE GetCommentsByPost
    @post_id INT
AS
BEGIN
    SELECT 
        Comments.id,
        Comments.post_id,
        Comments.user_id,
        Users.firstName + ' ' + Users.lastName AS UserName,
        Comments.content,
        Comments.created_at,
        Comments.updated_at
    FROM Comments
    INNER JOIN Users ON Comments.user_id = Users.id
    WHERE Comments.post_id = @post_id
    ORDER BY Comments.created_at ASC; -- Oldest comments first
END;



DROP PROCEDURE IF EXISTS GetCommentsByPost;
GO
CREATE PROCEDURE GetCommentsByPost
    @post_id INT
AS
BEGIN
    SELECT 
        Comments.id,
        Comments.post_id,
        Comments.user_id,
        Users.name AS UserName, -- Use actual column name from Users table
        Comments.content,
        Comments.created_at,
        Comments.updated_at
    FROM Comments
    INNER JOIN Users ON Comments.user_id = Users.id
    WHERE Comments.post_id = @post_id
    ORDER BY Comments.created_at ASC; -- Oldest comments first
END;
GO
