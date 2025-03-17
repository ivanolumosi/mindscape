CREATE PROCEDURE DeleteCrisisChatMessage
    @MessageId INT
AS
BEGIN
    -- Delete the message from the CrisisChat table
    DELETE FROM CrisisChat
    WHERE id = @MessageId;

    PRINT 'Crisis chat message deleted successfully.'
END;
