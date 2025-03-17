CREATE PROCEDURE AddDailyJournalEntry
    @user_id INT,
    @entry_date DATE,
    @mood NVARCHAR(50),
    @reflections NVARCHAR(MAX),
    @gratitude NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO DailyJournal (user_id, entry_date, mood, reflections, gratitude)
    VALUES (@user_id, @entry_date, @mood, @reflections, @gratitude);

    SELECT SCOPE_IDENTITY() AS NewEntryID;
END;
