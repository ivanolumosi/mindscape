CREATE PROCEDURE NotifySuccessfulSignIn
    @user_id INT
AS
BEGIN
    INSERT INTO Notifications (user_id, type, message)
    VALUES (@user_id, 'Successful Sign-In', 'You have successfully signed in.');
END;
