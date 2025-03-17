CREATE PROCEDURE GetMoodStatistics
    @user_id INT
AS
BEGIN
    SELECT mood, COUNT(*) AS mood_count
    FROM MoodTracker
    WHERE user_id = @user_id
    GROUP BY mood
    ORDER BY mood_count DESC;
END;
