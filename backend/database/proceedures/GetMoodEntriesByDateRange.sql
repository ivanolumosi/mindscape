CREATE PROCEDURE GetMoodEntriesByDateRange
    @user_id INT,
    @start_date DATETIME,
    @end_date DATETIME
AS
BEGIN
    SELECT id, mood, notes, recorded_at
    FROM MoodTracker
    WHERE user_id = @user_id
      AND recorded_at BETWEEN @start_date AND @end_date
    ORDER BY recorded_at DESC;
END;
