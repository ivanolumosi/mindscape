CREATE PROCEDURE AddResource
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
    INSERT INTO Resources (title, description, type, url, author, date_published, duration, event_date, created_at, updated_at)
    VALUES (@title, @description, @type, @url, @author, @date_published, @duration, @event_date, GETDATE(), GETDATE());
END;
