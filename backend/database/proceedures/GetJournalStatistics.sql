CREATE PROCEDURE GetJournalStatistics
    @user_id INT
AS
BEGIN
    SELECT 
        COUNT(*) AS TotalEntries,
        MIN(entry_date) AS FirstEntryDate,
        MAX(entry_date) AS LastEntryDate
    FROM DailyJournal
    WHERE user_id = @user_id;
END;
