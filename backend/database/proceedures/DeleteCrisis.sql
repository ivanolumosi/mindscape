CREATE PROCEDURE DeleteCrisis
    @CrisisId INT
AS
BEGIN
    -- Delete the crisis record
    DELETE FROM Crisis
    WHERE id = @CrisisId;
    
    -- Optionally, you can also delete related records (such as from CrisisCall, CrisisChat)
    -- DELETE FROM CrisisCall WHERE crisis_id = @CrisisId;
    -- DELETE FROM CrisisChat WHERE crisis_id = @CrisisId;

    PRINT 'Crisis record deleted successfully.'
END;
