CREATE PROCEDURE GetResourcesByAuthor
    @author NVARCHAR(255)
AS
BEGIN
    SELECT * 
    FROM Resources
    WHERE author = @author
    ORDER BY date_published DESC;
END;
