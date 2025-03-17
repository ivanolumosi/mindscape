CREATE PROCEDURE AddPost
    @user_id INT,
    @content NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Posts (user_id, content)
    VALUES (@user_id, @content);

    SELECT SCOPE_IDENTITY() AS NewPostID;
END;
