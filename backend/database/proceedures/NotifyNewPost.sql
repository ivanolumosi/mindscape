CREATE PROCEDURE NotifyNewPost
    @post_id INT,
    @author_id INT
AS
BEGIN
    INSERT INTO Notifications (user_id, type, message)
    SELECT f.friend_id, 'New Post', 'User ' + CAST(@author_id AS NVARCHAR) + ' made a new post (ID: ' + CAST(@post_id AS NVARCHAR) + ').'
    FROM Friends f WHERE f.user_id = @author_id;
END;