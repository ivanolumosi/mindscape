CREATE PROCEDURE GetUpcomingEvents
AS
BEGIN
    SELECT * 
    FROM Resources
    WHERE type = 'event' AND event_date >= GETDATE()
    ORDER BY event_date ASC;
END;

