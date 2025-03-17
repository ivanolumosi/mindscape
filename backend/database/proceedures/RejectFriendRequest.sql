CREATE PROCEDURE RejectFriendRequest
    @request_id INT
AS
BEGIN
    UPDATE FriendRequests
    SET status = 'Rejected'
    WHERE id = @request_id;
END;
