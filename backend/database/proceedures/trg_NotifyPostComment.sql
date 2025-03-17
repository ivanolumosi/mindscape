CREATE TRIGGER trg_NotifyPostComment
ON Comments
AFTER INSERT
AS
BEGIN
    DECLARE @user_id INT, @commenter_id INT, @post_id INT;
    SELECT @post_id = post_id, @commenter_id = user_id FROM inserted;
    SELECT @user_id = user_id FROM Posts WHERE id = @post_id;

    EXEC NotifyPostComment @user_id, @commenter_id, @post_id;
END;
