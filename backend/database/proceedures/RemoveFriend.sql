CREATE PROCEDURE RemoveFriend
    @user_id INT,
    @friend_id INT
AS
BEGIN
    DELETE FROM Friends
    WHERE (user_id = @user_id AND friend_id = @friend_id)
       OR (user_id = @friend_id AND friend_id = @user_id);
END;
