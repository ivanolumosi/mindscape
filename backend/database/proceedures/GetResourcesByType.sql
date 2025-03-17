CREATE PROCEDURE GetResourcesByType
    @type NVARCHAR(50)
AS
BEGIN
    SELECT * 
    FROM Resources
    WHERE type = @type
    ORDER BY created_at DESC;
END;
