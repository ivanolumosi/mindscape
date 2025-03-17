CREATE PROCEDURE DeleteMoodEntry
    @id INT
AS
BEGIN
    DELETE FROM MoodTracker
    WHERE id = @id;
END;
