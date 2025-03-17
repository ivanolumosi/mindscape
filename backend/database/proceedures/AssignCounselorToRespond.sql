DROP PROCEDURE IF EXISTS AssignCounselorToRespond;
GO
CREATE PROCEDURE AssignCounselorToRespond
    @crisis_id INT,
    @counselor_id INT
AS
BEGIN
    UPDATE Crisis
    SET counselor_id = @counselor_id, 
        status = 'In Progress',
        updated_at = GETDATE()
    WHERE id = @crisis_id AND status = 'Pending';

    SELECT * FROM Crisis WHERE id = @crisis_id;
END;
GO
