CREATE PROCEDURE GetConversationBetweenUsers
    @user_id_1 INT,
    @user_id_2 INT
AS
BEGIN
    SELECT *
    FROM DirectMessages
    WHERE (sender_id = @user_id_1 AND receiver_id = @user_id_2)
       OR (sender_id = @user_id_2 AND receiver_id = @user_id_1)
    ORDER BY created_at;
END;

