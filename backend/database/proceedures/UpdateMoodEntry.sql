CREATE PROCEDURE UpdateMoodEntry
    @id INT,
    @mood NVARCHAR(50),
    @notes NVARCHAR(500)
AS
BEGIN
    UPDATE MoodTracker
    SET mood = @mood,
        notes = @notes,
        recorded_at = GETDATE()
    WHERE id = @id;
END;
