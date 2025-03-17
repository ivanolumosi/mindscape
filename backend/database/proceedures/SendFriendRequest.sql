CREATE PROCEDURE SendFriendRequest
    @sender_id INT,
    @receiver_id INT
AS
BEGIN
    -- Ensure the request doesn't already exist
    IF NOT EXISTS (
        SELECT 1
        FROM FriendRequests
        WHERE (sender_id = @sender_id AND receiver_id = @receiver_id)
           OR (sender_id = @receiver_id AND receiver_id = @sender_id)
    )
    BEGIN
        INSERT INTO FriendRequests (sender_id, receiver_id)
        VALUES (@sender_id, @receiver_id);
    END
    ELSE
    BEGIN
        RAISERROR ('Friend request already exists.', 16, 1);
    END
END;
