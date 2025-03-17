CREATE PROCEDURE GetDailyJournalEntriesByDateRange
    @user_id INT,
    @start_date DATE,
    @end_date DATE
AS
BEGIN
    SELECT id, entry_date, mood, reflections, gratitude, created_at, updated_at
    FROM DailyJournal
    WHERE user_id = @user_id AND entry_date BETWEEN @start_date AND @end_date
    ORDER BY entry_date ASC;
END;
