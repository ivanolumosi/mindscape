CREATE PROCEDURE UpdateDailyJournalEntry
    @id INT,
    @mood NVARCHAR(50),
    @reflections NVARCHAR(MAX),
    @gratitude NVARCHAR(MAX)
AS
BEGIN
    UPDATE DailyJournal
    SET mood = @mood,
        reflections = @reflections,
        gratitude = @gratitude,
        updated_at = GETDATE()
    WHERE id = @id;
END;
