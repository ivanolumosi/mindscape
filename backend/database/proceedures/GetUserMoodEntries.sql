CREATE PROCEDURE GetUserMoodEntries
    @user_id INT
AS
BEGIN
    SELECT id, mood, notes, recorded_at
    FROM MoodTracker
    WHERE user_id = @user_id
    ORDER BY recorded_at DESC;
END;
