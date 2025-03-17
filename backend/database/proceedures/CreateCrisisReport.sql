CREATE PROCEDURE CreateCrisisReport
    @seeker_id INT,
    @crisis_type NVARCHAR(100),
    @description NVARCHAR(MAX),
    @priority INT = 1
AS
BEGIN
    INSERT INTO Crisis (seeker_id, crisis_type, description, priority)
    VALUES (@seeker_id, @crisis_type, @description, @priority);
    
    SELECT SCOPE_IDENTITY() AS NewCrisisID;
END;
