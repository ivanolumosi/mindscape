 CREATE PROCEDURE AddResponse
    @user_id INT,
    @question_id INT,
   @response_text NVARCHAR(MAX),
   @selected_option NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Responses (user_id, question_id, response_text, selected_option, submitted_at)
 VALUES (@user_id, @question_id, @response_text, @selected_option, GETDATE());
END;

EXEC AddResponse 
    @user_id = 3, 
    @question_id = 6, 
    @response_text = NULL, 
    @selected_option = 'Exercise';



