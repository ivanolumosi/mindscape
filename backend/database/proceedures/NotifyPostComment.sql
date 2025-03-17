CREATE PROCEDURE NotifyPostComment
    @user_id INT,  -- The post owner (recipient of notification)
    @commenter_id INT,
    @post_id INT
AS
BEGIN
    DECLARE @message NVARCHAR(MAX);
    SET @message = 'User ' + CAST(@commenter_id AS NVARCHAR) + ' commented on your post (ID: ' + CAST(@post_id AS NVARCHAR) + ').';

    INSERT INTO Notifications (user_id, type, message)
    VALUES (@user_id, 'Post Comment', @message);
END;
