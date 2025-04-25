CREATE PROCEDURE AcceptFriendRequest
    @request_id INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @sender_id INT;
    DECLARE @receiver_id INT;

    -- Retrieve sender and receiver IDs
    SELECT @sender_id = sender_id, @receiver_id = receiver_id
    FROM FriendRequests
    WHERE id = @request_id;

    -- Mark the request as accepted
    UPDATE FriendRequests
    SET status = 'Accepted'
    WHERE id = @request_id;

    -- Add the friendship (mutual)
    INSERT INTO Friends (user_id, friend_id)
    VALUES (@sender_id, @receiver_id),
           (@receiver_id, @sender_id);

    -- Return the updated friend request
    SELECT *
    FROM FriendRequests
    WHERE id = @request_id;
END;
