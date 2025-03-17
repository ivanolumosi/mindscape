CREATE PROCEDURE AddMoodEntry
    @user_id INT,
    @mood NVARCHAR(50),
    @notes NVARCHAR(500)
AS
BEGIN
    INSERT INTO MoodTracker (user_id, mood, notes)
    VALUES (@user_id, @mood, @notes);

    SELECT SCOPE_IDENTITY() AS NewMoodEntryID;
END;
