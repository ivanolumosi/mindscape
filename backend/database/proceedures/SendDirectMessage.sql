CREATE PROCEDURE SendDirectMessage
    @sender_id INT,
    @receiver_id INT,
    @content NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO DirectMessages (sender_id, receiver_id, content, is_read, created_at, updated_at)
    VALUES (@sender_id, @receiver_id, @content, 0, GETDATE(), GETDATE());

    -- Return the newly inserted row
    SELECT * FROM DirectMessages WHERE id = SCOPE_IDENTITY();
END;
