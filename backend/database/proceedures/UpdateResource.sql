CREATE PROCEDURE UpdateResource
    @id INT,
    @title NVARCHAR(255),
    @description NVARCHAR(MAX),
    @type NVARCHAR(50),
    @url NVARCHAR(255),
    @author NVARCHAR(255),
    @date_published DATETIME,
    @duration INT,
    @event_date DATETIME
AS
BEGIN
    UPDATE Resources
    SET title = @title,
        description = @description,
        type = @type,
        url = @url,
        author = @author,
        date_published = @date_published,
        duration = @duration,
        event_date = @event_date,
        updated_at = GETDATE()
    WHERE id = @id;
END;
