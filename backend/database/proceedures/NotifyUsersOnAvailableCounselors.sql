CREATE PROCEDURE NotifyUsersOnAvailableCounselors
AS
BEGIN
    INSERT INTO Notifications (user_id, type, message)
    SELECT u.id, 'Available Counselors', 
           'New counselors are available. Check their schedules to book a session.'
    FROM Users u WHERE u.role = 'seeker';
END;
