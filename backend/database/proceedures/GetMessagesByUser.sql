CREATE PROCEDURE GetMessagesByUser
    @user_id INT
AS
BEGIN
    SELECT *
    FROM DirectMessages
    WHERE sender_id = @user_id OR receiver_id = @user_id
    ORDER BY created_at;
END;
