CREATE PROCEDURE GetFriendList
    @user_id INT
AS
BEGIN
    SELECT f.friend_id, u.name AS friend_name, f.created_at
    FROM Friends f
    JOIN Users u ON f.friend_id = u.id
    WHERE f.user_id = @user_id
    ORDER BY f.created_at ASC;
END;
