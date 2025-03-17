CREATE PROCEDURE DeleteDailyJournalEntry
    @id INT
AS
BEGIN
    DELETE FROM DailyJournal
    WHERE id = @id;
END;
