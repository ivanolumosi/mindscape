CREATE PROCEDURE GetDailyJournalEntryById
    @id INT
AS
BEGIN
    SELECT id, user_id, entry_date, mood, reflections, gratitude, created_at, updated_at
    FROM DailyJournal
    WHERE id = @id;
END;
