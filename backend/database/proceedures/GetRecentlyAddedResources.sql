CREATE PROCEDURE GetRecentlyAddedResources
    @limit INT
AS
BEGIN
    SELECT TOP (@limit) * 
    FROM Resources
    ORDER BY created_at DESC;
END;
