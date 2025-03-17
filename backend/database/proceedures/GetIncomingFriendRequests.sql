CREATE PROCEDURE GetIncomingFriendRequests
    @user_id INT
AS
BEGIN
    SELECT fr.id, fr.sender_id, u.name AS sender_name, fr.status, fr.created_at
    FROM FriendRequests fr
    JOIN Users u ON fr.sender_id = u.id
    WHERE fr.receiver_id = @user_id AND fr.status = 'Pending'
    ORDER BY fr.created_at DESC;
END;
