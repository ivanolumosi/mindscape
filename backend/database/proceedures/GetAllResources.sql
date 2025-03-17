CREATE PROCEDURE GetAllResources
AS
BEGIN
    SELECT * 
    FROM Resources
    ORDER BY created_at DESC;
END;
