CREATE PROCEDURE GetAllUserMoods
AS
BEGIN
    SELECT id, user_id, mood, notes, recorded_at
    FROM MoodTracker
    ORDER BY recorded_at DESC;
END;
