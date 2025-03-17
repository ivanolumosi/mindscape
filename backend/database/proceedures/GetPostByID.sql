CREATE PROCEDURE GetPostById
    @PostId INT
AS
BEGIN
    -- Fetch a post by its ID
    SELECT 
        p.id, 
        p.user_id, 
        p.content, 
        p.created_at, 
        p.updated_at, 
        u.name AS user_name,    -- Include the user name of the post creator
        u.email AS user_email   -- Include the user's email
    FROM Posts p
    JOIN Users u ON p.user_id = u.id  -- Join with Users table to fetch user details
    WHERE p.id = @PostId;
END;
