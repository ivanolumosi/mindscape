CREATE PROCEDURE GetDirectMessages
    @user1_id INT,
    @user2_id INT
AS
BEGIN
    SELECT id, sender_id, receiver_id, content, is_read, created_at, updated_at
    FROM DirectMessages
    WHERE (sender_id = @user1_id AND receiver_id = @user2_id)
       OR (sender_id = @user2_id AND receiver_id = @user1_id)
    ORDER BY created_at ASC;
END;
