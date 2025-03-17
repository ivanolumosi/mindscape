CREATE PROCEDURE GetPostsByUser
    @user_id INT
AS
BEGIN
    SELECT 
        id, 
        content, 
        created_at, 
        updated_at
    FROM Posts
    WHERE user_id = @user_id
    ORDER BY created_at DESC;
END;
