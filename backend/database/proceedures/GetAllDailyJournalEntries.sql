CREATE PROCEDURE GetAllDailyJournalEntries
AS
BEGIN
    SELECT 
        id, 
        user_id, 
        entry_date, 
        mood, 
        reflections, 
        gratitude, 
        created_at, 
        updated_at
    FROM DailyJournal
    ORDER BY entry_date DESC;  -- Sort by most recent entries first
END;
