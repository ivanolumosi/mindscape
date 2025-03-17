CREATE PROCEDURE DeleteMessagesBetweenUsers
    @user1_id INT,
    @user2_id INT
AS
BEGIN
    DELETE FROM DirectMessages
    WHERE (sender_id = @user1_id AND receiver_id = @user2_id)
       OR (sender_id = @user2_id AND receiver_id = @user1_id);
END;
