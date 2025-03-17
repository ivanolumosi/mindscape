CREATE PROCEDURE GetAllPosts
AS
BEGIN
    SELECT 
        Posts.id, 
        Posts.user_id, 
        Users.firstName + ' ' + Users.lastName AS UserName,
        Posts.content, 
        Posts.created_at, 
        Posts.updated_at
    FROM Posts
    INNER JOIN Users ON Posts.user_id = Users.id
    ORDER BY Posts.created_at DESC;
END;


DROP PROCEDURE IF EXISTS GetAllPosts;
GO
CREATE PROCEDURE GetAllPosts
AS
BEGIN
    SELECT 
        Posts.id, 
        Posts.user_id, 
        Users.name AS UserName, -- Use actual column name from Users table
        Posts.content, 
        Posts.created_at, 
        Posts.updated_at
    FROM Posts
    INNER JOIN Users ON Posts.user_id = Users.id
    ORDER BY Posts.created_at DESC;
END;
GO
