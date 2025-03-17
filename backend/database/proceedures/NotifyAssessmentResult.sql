CREATE PROCEDURE NotifyAssessmentResult
    @user_id INT,
    @assessment_title NVARCHAR(255),
    @score INT
AS
BEGIN
    DECLARE @message NVARCHAR(MAX);
    SET @message = 'Your assessment "' + @assessment_title + '" is completed. Your score: ' + CAST(@score AS NVARCHAR) + '.';

    INSERT INTO Notifications (user_id, type, message)
    VALUES (@user_id, 'Assessment Result', @message);
END;
