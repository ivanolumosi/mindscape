CREATE PROCEDURE GetDailyJournalEntriesByUser
    @UserId INT
AS
BEGIN
    -- Fetch all daily journal entries for the given user_id
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
    WHERE user_id = @UserId
    ORDER BY entry_date DESC;  -- Sort by entry date in descending order
END;
