-- =============================================
-- User Profile Management
-- =============================================

-- Create/Update User Profile
DROP PROCEDURE IF EXISTS sp_CreateUpdateUserProfile;
GO
CREATE PROCEDURE sp_CreateUpdateUserProfile
    @id INT = NULL,
    @name NVARCHAR(100),
    @email NVARCHAR(100),
    @password NVARCHAR(255),
    @role NVARCHAR(50),
    @profile_image NVARCHAR(255) = NULL,
    @specialization NVARCHAR(100) = NULL,
    @faculty NVARCHAR(100) = NULL,
    @privileges NVARCHAR(255) = NULL,
    @availability_schedule NVARCHAR(MAX) = NULL,
    @nickname NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @id IS NULL
    BEGIN
        -- Create new user
        INSERT INTO Users (name, email, password, role, profile_image, specialization, 
                          faculty, privileges, availability_schedule)
        VALUES (@name, @email, @password, @role, @profile_image, @specialization, 
                @faculty, @privileges, @availability_schedule);
        
        SET @id = SCOPE_IDENTITY();
        
        -- If nickname provided, create in a UserProfiles table (assuming this exists or needs to be created)
        IF @nickname IS NOT NULL
        BEGIN
            -- You would need to create this table
            IF OBJECT_ID('UserProfiles', 'U') IS NULL
            BEGIN
                CREATE TABLE UserProfiles (
                    user_id INT PRIMARY KEY,
                    nickname NVARCHAR(50),
                    FOREIGN KEY (user_id) REFERENCES Users(id)
                );
            END
            
            INSERT INTO UserProfiles (user_id, nickname)
            VALUES (@id, @nickname);
        END
    END
    ELSE
    BEGIN
        -- Update existing user
        UPDATE Users
        SET name = @name,
            email = @email,
            password = CASE WHEN @password IS NOT NULL THEN @password ELSE password END,
            profile_image = @profile_image,
            specialization = @specialization,
            faculty = @faculty,
            privileges = @privileges,
            availability_schedule = @availability_schedule,
            updated_at = GETDATE()
        WHERE id = @id;
        
        -- Update nickname if it exists
        IF @nickname IS NOT NULL AND OBJECT_ID('UserProfiles', 'U') IS NOT NULL
        BEGIN
            IF EXISTS (SELECT 1 FROM UserProfiles WHERE user_id = @id)
                UPDATE UserProfiles SET nickname = @nickname WHERE user_id = @id;
            ELSE
                INSERT INTO UserProfiles (user_id, nickname) VALUES (@id, @nickname);
        END
    END
    
    SELECT @id AS UserID;
END;
GO

-- Get User Profile
DROP PROCEDURE IF EXISTS sp_GetUserProfile;
GO
CREATE PROCEDURE sp_GetUserProfile
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT u.*, up.nickname
    FROM Users u
    LEFT JOIN UserProfiles up ON u.id = up.user_id
    WHERE u.id = @user_id;
END;
GO

-- Delete User
DROP PROCEDURE IF EXISTS sp_DeleteUser;
GO
CREATE PROCEDURE sp_DeleteUser
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Delete from all related tables
        -- Messages
        DELETE FROM DirectMessages WHERE sender_id = @user_id OR receiver_id = @user_id;
        DELETE FROM GroupMessages WHERE sender_id = @user_id;
        
        -- Social connections
        DELETE FROM Friends WHERE user_id = @user_id OR friend_id = @user_id;
        DELETE FROM FriendRequests WHERE sender_id = @user_id OR receiver_id = @user_id;
        
        -- Group memberships
        DELETE FROM GroupMembers WHERE user_id = @user_id;
        
        -- Delete groups created by user (optional - could transfer ownership instead)
        DELETE FROM GroupMessages WHERE group_id IN (SELECT id FROM Groups WHERE created_by = @user_id);
        DELETE FROM GroupMembers WHERE group_id IN (SELECT id FROM Groups WHERE created_by = @user_id);
        DELETE FROM Groups WHERE created_by = @user_id;
        
        -- Delete posts and comments
        DELETE FROM Comments WHERE user_id = @user_id;
        DELETE FROM Comments WHERE post_id IN (SELECT id FROM Posts WHERE user_id = @user_id);
        DELETE FROM Posts WHERE user_id = @user_id;
        
        -- Delete profile
        IF OBJECT_ID('UserProfiles', 'U') IS NOT NULL
            DELETE FROM UserProfiles WHERE user_id = @user_id;
            
        -- Finally delete the user
        DELETE FROM Users WHERE id = @user_id;
        
        COMMIT TRANSACTION;
        SELECT 'User deleted successfully' AS Result;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT ERROR_MESSAGE() AS ErrorMessage;
    END CATCH;
END;
GO

-- =============================================
-- Friendship Management
-- =============================================

-- Send Friend Request
DROP PROCEDURE IF EXISTS sp_SendFriendRequest;
GO
CREATE PROCEDURE sp_SendFriendRequest
    @sender_id INT,
    @receiver_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if users exist
    IF NOT EXISTS (SELECT 1 FROM Users WHERE id = @sender_id) OR 
       NOT EXISTS (SELECT 1 FROM Users WHERE id = @receiver_id)
    BEGIN
        SELECT 'One or both users do not exist' AS ErrorMessage;
        RETURN;
    END
    
    -- Check if already friends
    IF EXISTS (SELECT 1 FROM Friends 
               WHERE (user_id = @sender_id AND friend_id = @receiver_id) OR 
                     (user_id = @receiver_id AND friend_id = @sender_id))
    BEGIN
        SELECT 'Users are already friends' AS ErrorMessage;
        RETURN;
    END
    
    -- Check if request already exists
    IF EXISTS (SELECT 1 FROM FriendRequests 
               WHERE sender_id = @sender_id AND receiver_id = @receiver_id AND status = 'Pending')
    BEGIN
        SELECT 'Friend request already sent' AS ErrorMessage;
        RETURN;
    END
    
    -- Insert new request
    INSERT INTO FriendRequests (sender_id, receiver_id, status)
    VALUES (@sender_id, @receiver_id, 'Pending');
    
    SELECT 'Friend request sent successfully' AS Result;
END;
GO

-- Accept/Reject Friend Request
DROP PROCEDURE IF EXISTS sp_RespondToFriendRequest;
GO
CREATE PROCEDURE sp_RespondToFriendRequest
    @request_id INT,
    @response NVARCHAR(50)  -- 'Accepted' or 'Rejected'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if request exists
    IF NOT EXISTS (SELECT 1 FROM FriendRequests WHERE id = @request_id)
    BEGIN
        SELECT 'Friend request not found' AS ErrorMessage;
        RETURN;
    END
    
    -- Update request status
    UPDATE FriendRequests
    SET status = @response
    WHERE id = @request_id;
    
    -- If accepted, create friendship
    IF @response = 'Accepted'
    BEGIN
        DECLARE @sender_id INT, @receiver_id INT;
        
        SELECT @sender_id = sender_id, @receiver_id = receiver_id
        FROM FriendRequests
        WHERE id = @request_id;
        
        INSERT INTO Friends (user_id, friend_id)
        VALUES (@sender_id, @receiver_id);
        
        SELECT 'Friend request accepted' AS Result;
    END
    ELSE
    BEGIN
        SELECT 'Friend request rejected' AS Result;
    END
END;
GO

-- Cancel Sent Friend Request
DROP PROCEDURE IF EXISTS sp_CancelFriendRequest;
GO
CREATE PROCEDURE sp_CancelFriendRequest
    @request_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if request exists
    IF NOT EXISTS (SELECT 1 FROM FriendRequests WHERE id = @request_id AND status = 'Pending')
    BEGIN
        SELECT 'Pending friend request not found' AS ErrorMessage;
        RETURN;
    END
    
    -- Delete the request
    DELETE FROM FriendRequests WHERE id = @request_id;
    
    SELECT 'Friend request cancelled successfully' AS Result;
END;
GO

-- Remove Friend
DROP PROCEDURE IF EXISTS sp_RemoveFriend;
GO
CREATE PROCEDURE sp_RemoveFriend
    @user_id INT,
    @friend_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if friendship exists
    IF NOT EXISTS (SELECT 1 FROM Friends 
                   WHERE (user_id = @user_id AND friend_id = @friend_id) OR 
                         (user_id = @friend_id AND friend_id = @user_id))
    BEGIN
        SELECT 'Friendship not found' AS ErrorMessage;
        RETURN;
    END
    
    -- Remove friendship
    DELETE FROM Friends 
    WHERE (user_id = @user_id AND friend_id = @friend_id) OR 
          (user_id = @friend_id AND friend_id = @user_id);
    
    SELECT 'Friend removed successfully' AS Result;
END;
GO

DROP PROCEDURE IF EXISTS sp_GetFriendList;
GO

CREATE PROCEDURE sp_GetFriendList
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        f.id AS friendship_id,
        u.id AS friend_id,
        u.name AS friend_name,
        u.email,
        u.role,
        u.profile_image,
        up.nickname,
        u.specialization,
        f.created_at,
        CASE 
            WHEN u.role = 'counselor' THEN 1 
            ELSE 0 
        END AS is_counselor
    FROM Friends f
    INNER JOIN Users u 
        ON u.id = CASE 
                    WHEN f.user_id = @user_id THEN f.friend_id 
                    ELSE f.user_id 
                 END
    LEFT JOIN UserProfiles up 
        ON u.id = up.user_id
    WHERE f.user_id = @user_id OR f.friend_id = @user_id
    ORDER BY u.name;
END;
GO


-- Get Pending Friend Requests (Sent and Received)
DROP PROCEDURE IF EXISTS sp_GetPendingFriendRequests;
GO
CREATE PROCEDURE sp_GetPendingFriendRequests
    @user_id INT,
    @request_type NVARCHAR(10) = 'all'  -- 'sent', 'received', or 'all'
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @request_type = 'sent' OR @request_type = 'all'
    BEGIN
        SELECT fr.id, 'sent' AS request_type,
               u.id AS user_id, u.name, u.email, u.profile_image, up.nickname,
               fr.created_at, fr.status
        FROM FriendRequests fr
        INNER JOIN Users u ON fr.receiver_id = u.id
        LEFT JOIN UserProfiles up ON u.id = up.user_id
        WHERE fr.sender_id = @user_id AND fr.status = 'Pending';
    END
    
    IF @request_type = 'received' OR @request_type = 'all'
    BEGIN
        SELECT fr.id, 'received' AS request_type,
               u.id AS user_id, u.name, u.email, u.profile_image, up.nickname,
               fr.created_at, fr.status
        FROM FriendRequests fr
        INNER JOIN Users u ON fr.sender_id = u.id
        LEFT JOIN UserProfiles up ON u.id = up.user_id
        WHERE fr.receiver_id = @user_id AND fr.status = 'Pending';
    END
END;
GO

-- Get Recommended Friends
DROP PROCEDURE IF EXISTS sp_GetRecommendedFriends;
GO
CREATE PROCEDURE sp_GetRecommendedFriends
    @user_id INT,
    @recommendation_type NVARCHAR(50) = 'all',  -- 'faculty', 'mutual', 'counselor', 'all'
    @limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Create temp table for results
    CREATE TABLE #RecommendedFriends (
        user_id INT,
        recommendation_reason NVARCHAR(100),
        mutual_count INT DEFAULT 0
    );
    
    -- Get user's faculty for faculty-based recommendations
    DECLARE @user_faculty NVARCHAR(100);
    SELECT @user_faculty = faculty FROM Users WHERE id = @user_id;
    
    -- Get existing friends to exclude
    CREATE TABLE #ExistingConnections (user_id INT);
    
    INSERT INTO #ExistingConnections
    SELECT friend_id FROM Friends WHERE user_id = @user_id
    UNION
    SELECT user_id FROM Friends WHERE friend_id = @user_id
    UNION
    SELECT receiver_id FROM FriendRequests 
    WHERE sender_id = @user_id AND status = 'Pending'
    UNION
    SELECT sender_id FROM FriendRequests 
    WHERE receiver_id = @user_id AND status = 'Pending';
    
    -- Add the user themselves to exclude
    INSERT INTO #ExistingConnections VALUES (@user_id);
    
    -- Faculty-based recommendations
    IF @recommendation_type IN ('faculty', 'all') AND @user_faculty IS NOT NULL
    BEGIN
        INSERT INTO #RecommendedFriends (user_id, recommendation_reason)
        SELECT TOP (@limit) id, 'Same faculty: ' + @user_faculty
        FROM Users
        WHERE faculty = @user_faculty
        AND id NOT IN (SELECT user_id FROM #ExistingConnections)
        ORDER BY NEWID(); -- Random selection
    END
    
    -- Counselor recommendations
    IF @recommendation_type IN ('counselor', 'all')
    BEGIN
        INSERT INTO #RecommendedFriends (user_id, recommendation_reason)
        SELECT TOP (@limit) id, 'Counselor specializing in: ' + specialization
        FROM Users
        WHERE role = 'counselor'
        AND id NOT IN (SELECT user_id FROM #ExistingConnections)
        ORDER BY NEWID(); -- Random selection
    END
    
    -- Mutual friends recommendations
    IF @recommendation_type IN ('mutual', 'all')
    BEGIN
        -- Get friends of friends
        WITH UserFriends AS (
            -- Get all friends of the user
            SELECT friend_id AS friend_id FROM Friends WHERE user_id = @user_id
            UNION
            SELECT user_id AS friend_id FROM Friends WHERE friend_id = @user_id
        ),
        FriendsOfFriends AS (
            -- Get all friends of user's friends
            SELECT f.friend_id AS potential_friend, uf.friend_id AS mutual_friend
            FROM Friends f
            INNER JOIN UserFriends uf ON f.user_id = uf.friend_id
            WHERE f.friend_id NOT IN (SELECT user_id FROM #ExistingConnections)
            UNION
            SELECT f.user_id AS potential_friend, uf.friend_id AS mutual_friend
            FROM Friends f
            INNER JOIN UserFriends uf ON f.friend_id = uf.friend_id
            WHERE f.user_id NOT IN (SELECT user_id FROM #ExistingConnections)
        ),
        MutualFriendCount AS (
            -- Count mutual friends
            SELECT potential_friend, COUNT(DISTINCT mutual_friend) AS mutual_count
            FROM FriendsOfFriends
            GROUP BY potential_friend
        )
        
        INSERT INTO #RecommendedFriends (user_id, recommendation_reason, mutual_count)
        SELECT TOP (@limit) mfc.potential_friend, 
               CAST(mutual_count AS NVARCHAR(10)) + ' mutual friends', 
               mutual_count
        FROM MutualFriendCount mfc
        ORDER BY mutual_count DESC;
    END
    
    -- Return recommendations with user info
    SELECT u.id, u.name, u.email, u.role, u.profile_image, up.nickname,
           rf.recommendation_reason, rf.mutual_count
    FROM #RecommendedFriends rf
    INNER JOIN Users u ON rf.user_id = u.id
    LEFT JOIN UserProfiles up ON u.id = up.user_id
    ORDER BY 
        CASE WHEN u.role = 'counselor' THEN 0 ELSE 1 END, -- Prioritize counselors
        rf.mutual_count DESC, -- Then by mutual friends count
        u.name; -- Then alphabetically
    
    -- Clean up
    DROP TABLE #RecommendedFriends;
    DROP TABLE #ExistingConnections;
END;
GO

-- =============================================
-- Direct Messaging
-- =============================================

-- Send Direct Message
DROP PROCEDURE IF EXISTS sp_SendDirectMessage;
GO
CREATE PROCEDURE sp_SendDirectMessage
    @sender_id INT,
    @receiver_id INT,
    @content NVARCHAR(MAX),
    @content_type NVARCHAR(50) = 'text',
    @media_url NVARCHAR(255) = NULL,
    @parent_message_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate users
    IF NOT EXISTS (SELECT 1 FROM Users WHERE id = @sender_id) OR 
       NOT EXISTS (SELECT 1 FROM Users WHERE id = @receiver_id)
    BEGIN
        SELECT 'One or both users do not exist' AS ErrorMessage;
        RETURN;
    END
    
    -- Validate parent message if provided
    IF @parent_message_id IS NOT NULL AND 
       NOT EXISTS (SELECT 1 FROM DirectMessages WHERE id = @parent_message_id)
    BEGIN
        SELECT 'Parent message does not exist' AS ErrorMessage;
        RETURN;
    END
    
    -- Insert message
    INSERT INTO DirectMessages (
        sender_id, receiver_id, content, content_type, 
        media_url, parent_message_id
    )
    VALUES (
        @sender_id, @receiver_id, @content, @content_type,
        @media_url, @parent_message_id
    );
    
    -- Return the new message details
    SELECT @@IDENTITY AS message_id, GETDATE() AS sent_at;
END;
GO

-- Edit Direct Message
DROP PROCEDURE IF EXISTS sp_EditDirectMessage;
GO
CREATE PROCEDURE sp_EditDirectMessage
    @message_id INT,
    @sender_id INT,
    @content NVARCHAR(MAX),
    @content_type NVARCHAR(50) = NULL,
    @media_url NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if message exists and belongs to sender
    IF NOT EXISTS (SELECT 1 FROM DirectMessages 
                   WHERE id = @message_id AND sender_id = @sender_id)
    BEGIN
        SELECT 'Message not found or you are not the sender' AS ErrorMessage;
        RETURN;
    END
    
    -- Update message
    UPDATE DirectMessages
    SET content = @content,
        content_type = ISNULL(@content_type, content_type),
        media_url = ISNULL(@media_url, media_url),
        updated_at = GETDATE(),
        is_edited = 1
    WHERE id = @message_id;
    
    SELECT 'Message updated successfully' AS Result;
END;
GO

-- Mark Message as Read
DROP PROCEDURE IF EXISTS sp_MarkMessageAsRead;
GO
CREATE PROCEDURE sp_MarkMessageAsRead
    @message_id INT,
    @receiver_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Verify the message is for the receiver
    IF NOT EXISTS (SELECT 1 FROM DirectMessages 
                   WHERE id = @message_id AND receiver_id = @receiver_id)
    BEGIN
        SELECT 'Message not found or you are not the receiver' AS ErrorMessage;
        RETURN;
    END
    
    -- Mark as read
    UPDATE DirectMessages
    SET is_read = 1
    WHERE id = @message_id;
    
    SELECT 'Message marked as read' AS Result;
END;
GO

-- Get Chat History
DROP PROCEDURE IF EXISTS sp_GetChatHistory;
GO
CREATE PROCEDURE sp_GetChatHistory
    @user1_id INT,
    @user2_id INT,
    @limit INT = 50,
    @before_message_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get messages between users with pagination
    SELECT TOP (@limit)
        dm.id, dm.sender_id, dm.receiver_id, dm.content, 
        dm.content_type, dm.media_url, dm.parent_message_id,
        dm.is_read, dm.is_edited, dm.created_at, dm.updated_at,
        s.name AS sender_name, s.profile_image AS sender_image,
        r.name AS receiver_name, r.profile_image AS receiver_image,
        CASE WHEN s.role = 'counselor' THEN 1 ELSE 0 END AS is_sender_counselor
    FROM DirectMessages dm
    INNER JOIN Users s ON dm.sender_id = s.id
    INNER JOIN Users r ON dm.receiver_id = r.id
    WHERE ((dm.sender_id = @user1_id AND dm.receiver_id = @user2_id) OR
           (dm.sender_id = @user2_id AND dm.receiver_id = @user1_id)) AND
          (@before_message_id IS NULL OR dm.id < @before_message_id)
    ORDER BY dm.created_at DESC;
END;
GO

-- Get User's Chat List
DROP PROCEDURE IF EXISTS sp_GetUserChatList;
GO
CREATE PROCEDURE sp_GetUserChatList
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH LastMessages AS (
        -- Get the most recent message for each conversation
        SELECT 
            CASE 
                WHEN dm.sender_id = @user_id THEN dm.receiver_id
                ELSE dm.sender_id
            END AS chat_user_id,
            MAX(dm.id) AS last_message_id
        FROM DirectMessages dm
        WHERE dm.sender_id = @user_id OR dm.receiver_id = @user_id
        GROUP BY 
            CASE 
                WHEN dm.sender_id = @user_id THEN dm.receiver_id
                ELSE dm.sender_id
            END
    )
    
    SELECT 
        u.id, u.name, u.profile_image, u.role,
        up.nickname,
        dm.id AS last_message_id,
        dm.content AS last_message_content,
        dm.content_type AS last_message_type,
        dm.sender_id AS last_message_sender_id,
        dm.created_at AS last_message_time,
        CASE WHEN dm.is_read = 0 AND dm.receiver_id = @user_id THEN 1 ELSE 0 END AS has_unread,
        (SELECT COUNT(*) FROM DirectMessages 
         WHERE receiver_id = @user_id AND sender_id = u.id AND is_read = 0) AS unread_count,
        CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_friend,
        CASE WHEN u.role = 'counselor' THEN 1 ELSE 0 END AS is_counselor
    FROM LastMessages lm
    INNER JOIN DirectMessages dm ON lm.last_message_id = dm.id
    INNER JOIN Users u ON lm.chat_user_id = u.id
    LEFT JOIN UserProfiles up ON u.id = up.user_id
    LEFT JOIN Friends f ON (f.user_id = @user_id AND f.friend_id = u.id) OR
                           (f.user_id = u.id AND f.friend_id = @user_id)
    ORDER BY dm.created_at DESC;
END;
GO

-- Get Unread Message Count
DROP PROCEDURE IF EXISTS sp_GetUnreadMessageCount;
GO
CREATE PROCEDURE sp_GetUnreadMessageCount
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT
        COUNT(*) AS total_unread,
        COUNT(DISTINCT sender_id) AS unread_conversations
    FROM DirectMessages
    WHERE receiver_id = @user_id AND is_read = 0;
END;
GO

-- =============================================
-- Groups Management
-- =============================================

-- Create Group
DROP PROCEDURE IF EXISTS sp_CreateGroup;
GO
CREATE PROCEDURE sp_CreateGroup
    @name NVARCHAR(100),
    @description NVARCHAR(255),
    @created_by INT,
    @initial_members NVARCHAR(MAX) = NULL -- Comma-separated user IDs
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    -- Create group
    INSERT INTO Groups (name, description, created_by)
    VALUES (@name, @description, @created_by);
    
    DECLARE @group_id INT = SCOPE_IDENTITY();
    
    -- Add creator as admin
    INSERT INTO GroupMembers (group_id, user_id, is_admin)
    VALUES (@group_id, @created_by, 1);
    
    -- Add initial members if provided
    IF @initial_members IS NOT NULL
    BEGIN
        CREATE TABLE #InitialMembers (user_id INT);
        
        -- Parse comma-separated values
        INSERT INTO #InitialMembers
        SELECT CAST(value AS INT)
        FROM STRING_SPLIT(@initial_members, ',');
        
        -- Add members
        INSERT INTO GroupMembers (group_id, user_id, is_admin)
        SELECT @group_id, user_id, 0
        FROM #InitialMembers
        WHERE user_id <> @created_by -- Skip creator (already added)
        AND EXISTS (SELECT 1 FROM Users WHERE id = user_id); -- Verify user exists
        
        DROP TABLE #InitialMembers;
    END
    
    COMMIT TRANSACTION;
    
    SELECT @group_id AS group_id, 'Group created successfully' AS Result;
END;
GO

-- Delete Group
DROP PROCEDURE IF EXISTS sp_DeleteGroup;
GO
CREATE PROCEDURE sp_DeleteGroup
    @group_id INT,
    @user_id INT -- Must be group admin
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if user is group admin
    IF NOT EXISTS (SELECT 1 FROM GroupMembers 
                   WHERE group_id = @group_id AND user_id = @user_id AND is_admin = 1)
    BEGIN
        SELECT 'You must be a group admin to delete the group' AS ErrorMessage;
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    -- Delete all related records
    DELETE FROM GroupMessages WHERE group_id = @group_id;
    DELETE FROM GroupMembers WHERE group_id = @group_id;
    DELETE FROM Groups WHERE id = @group_id;
    
    COMMIT TRANSACTION;
    
    SELECT 'Group deleted successfully' AS Result;
END;
GO

-- Join Group
DROP PROCEDURE IF EXISTS sp_JoinGroup;
GO
CREATE PROCEDURE sp_JoinGroup
    @group_id INT,
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if group exists
    IF NOT EXISTS (SELECT 1 FROM Groups WHERE id = @group_id)
    BEGIN
        SELECT 'Group does not exist' AS ErrorMessage;
        RETURN;
    END
    
    -- Check if already a member
    IF EXISTS (SELECT 1 FROM GroupMembers WHERE group_id = @group_id AND user_id = @user_id)
    BEGIN
        SELECT 'User is already a member of this group' AS ErrorMessage;
        RETURN;
    END
    
    -- Add to group
    INSERT INTO GroupMembers (group_id, user_id)
    VALUES (@group_id, @user_id);
    
    SELECT 'Successfully joined the group' AS Result;
END;
GO

-- Leave Group
DROP PROCEDURE IF EXISTS sp_LeaveGroup;
GO
CREATE PROCEDURE sp_LeaveGroup
    @group_id INT,
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if member
    IF NOT EXISTS (SELECT 1 FROM GroupMembers WHERE group_id = @group_id AND user_id = @user_id)
    BEGIN
        SELECT 'User is not a member of this group' AS ErrorMessage;
        RETURN;
    END
    
    -- Check if last admin
    IF EXISTS (SELECT 1 FROM GroupMembers WHERE group_id = @group_id AND user_id = @user_id AND is_admin = 1)
    BEGIN
        DECLARE @admin_count INT;
        SELECT @admin_count = COUNT(*) 
        FROM GroupMembers 
        WHERE group_id = @group_id AND is_admin = 1;
        
        IF @admin_count = 1
        BEGIN
            SELECT 'Cannot leave group as you are the only admin. Transfer admin rights or delete the group.' AS ErrorMessage;
            RETURN;
        END
    END
    
    -- Remove from group
    DELETE FROM GroupMembers
    WHERE group_id = @group_id AND user_id = @user_id;
    
    SELECT 'Successfully left the group' AS Result;
END;
GO

-- Add/Remove Group Admin
DROP PROCEDURE IF EXISTS sp_ChangeGroupAdmin;
GO
CREATE PROCEDURE sp_ChangeGroupAdmin
    @group_id INT,
    @admin_id INT, -- Current admin making the change
    @user_id INT,  -- User to promote/demote
    @make_admin BIT -- 1 = make admin, 0 = remove admin
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if admin_id is an admin
    IF NOT EXISTS (SELECT 1 FROM GroupMembers 
                   WHERE group_id = @group_id AND user_id = @admin_id AND is_admin = 1)
    BEGIN
        SELECT 'You must be a group admin to make this change' AS ErrorMessage;
        RETURN;
    END
    
    -- Check if user is a member
    IF NOT EXISTS (SELECT 1 FROM GroupMembers 
                   WHERE group_id = @group_id AND user_id = @user_id)
    BEGIN
        SELECT 'User is not a member of this group' AS ErrorMessage;
        RETURN;
    END
    
    -- Update admin status
    UPDATE GroupMembers
    SET is_admin = @make_admin
    WHERE group_id = @group_id AND user_id = @user_id;
    
    SELECT 'Group admin status updated successfully' AS Result;
END;
GO

-- Send Group Message
DROP PROCEDURE IF EXISTS sp_SendGroupMessage;
GO
CREATE PROCEDURE sp_SendGroupMessage
    @group_id INT,
    @sender_id INT,
    @content NVARCHAR(MAX),
    @content_type NVARCHAR(50) = 'text',
    @media_url NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if user is a member
    IF NOT EXISTS (SELECT 1 FROM GroupMembers 
                   WHERE group_id = @group_id AND user_id = @sender_id)
    BEGIN
        SELECT 'You must be a group member to send messages' AS ErrorMessage;
        RETURN;
    END
    
    -- Insert message
    INSERT INTO GroupMessages (
        group_id, sender_id, content, content_type, media_url
    )
    VALUES (
        @group_id, @sender_id, @content, @content_type, @media_url
    );
    
    -- Return the new message details
    SELECT @@IDENTITY AS message_id, GETDATE() AS sent_at;
END;
GO

-- Get Group Messages
DROP PROCEDURE IF EXISTS sp_GetGroupMessages;
GO
-- Get Group Messages (Continued from previous code)
CREATE PROCEDURE sp_GetGroupMessages
    @group_id INT,
    @user_id INT, -- User requesting messages (for access verification)
    @limit INT = 50,
    @before_message_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if user is a member
    IF NOT EXISTS (SELECT 1 FROM GroupMembers 
                   WHERE group_id = @group_id AND user_id = @user_id)
    BEGIN
        SELECT 'You must be a group member to view messages' AS ErrorMessage;
        RETURN;
    END
    
    -- Get messages with pagination
    SELECT TOP (@limit)
        gm.id, gm.sender_id, gm.content, gm.content_type, 
        gm.media_url, gm.is_edited, gm.created_at, gm.updated_at,
        u.name AS sender_name, u.profile_image AS sender_image,
        CASE WHEN u.role = 'counselor' THEN 1 ELSE 0 END AS is_sender_counselor,
        CASE WHEN gm.is_read = 0 AND gm.sender_id <> @user_id THEN 1 ELSE 0 END AS is_unread,
        CASE WHEN gm2.is_admin = 1 THEN 1 ELSE 0 END AS is_sender_admin
    FROM GroupMessages gm
    INNER JOIN Users u ON gm.sender_id = u.id
    LEFT JOIN GroupMembers gm2 ON gm.group_id = gm2.group_id AND gm.sender_id = gm2.user_id
    WHERE gm.group_id = @group_id AND
          (@before_message_id IS NULL OR gm.id < @before_message_id)
    ORDER BY gm.created_at DESC;
    
    -- Mark messages as read
    UPDATE gm
    SET gm.is_read = 1
    FROM GroupMessages gm
    WHERE gm.group_id = @group_id
      AND gm.sender_id <> @user_id
      AND gm.is_read = 0;
END;
GO

-- Get User's Groups
DROP PROCEDURE IF EXISTS sp_GetUserGroups;
GO
CREATE PROCEDURE sp_GetUserGroups
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        g.id, g.name, g.description, g.created_at,
        u.name AS created_by_name, u.profile_image AS created_by_image,
        gm.is_admin,
        (SELECT COUNT(*) FROM GroupMembers WHERE group_id = g.id) AS member_count,
        (SELECT COUNT(*) 
         FROM GroupMessages gm2 
         WHERE gm2.group_id = g.id AND gm2.sender_id <> @user_id AND gm2.is_read = 0) AS unread_count,
        (SELECT TOP 1 gm2.content 
         FROM GroupMessages gm2 
         WHERE gm2.group_id = g.id 
         ORDER BY gm2.created_at DESC) AS last_message,
        (SELECT TOP 1 gm2.created_at 
         FROM GroupMessages gm2 
         WHERE gm2.group_id = g.id 
         ORDER BY gm2.created_at DESC) AS last_activity
    FROM Groups g
    INNER JOIN GroupMembers gm ON g.id = gm.group_id
    INNER JOIN Users u ON g.created_by = u.id
    WHERE gm.user_id = @user_id
    ORDER BY last_activity DESC;
END;
GO

-- Get Group Members
DROP PROCEDURE IF EXISTS sp_GetGroupMembers;
GO
CREATE PROCEDURE sp_GetGroupMembers
    @group_id INT,
    @user_id INT -- User requesting (for access verification)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if user is a member
    IF NOT EXISTS (SELECT 1 FROM GroupMembers 
                   WHERE group_id = @group_id AND user_id = @user_id)
    BEGIN
        SELECT 'You must be a group member to view members' AS ErrorMessage;
        RETURN;
    END
    
    -- Get members
    SELECT 
        u.id, u.name, u.email, u.role, u.profile_image,
        up.nickname,
        gm.is_admin, gm.joined_at,
        CASE WHEN u.id = @user_id THEN 1 ELSE 0 END AS is_current_user,
        CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END AS is_friend,
        CASE WHEN u.role = 'counselor' THEN 1 ELSE 0 END AS is_counselor
    FROM GroupMembers gm
    INNER JOIN Users u ON gm.user_id = u.id
    LEFT JOIN UserProfiles up ON u.id = up.user_id
    LEFT JOIN Friends f ON (f.user_id = @user_id AND f.friend_id = u.id) OR
                           (f.user_id = u.id AND f.friend_id = @user_id)
    WHERE gm.group_id = @group_id
    ORDER BY gm.is_admin DESC, u.name;
END;
GO

-- Send Group Invite
DROP PROCEDURE IF EXISTS sp_SendGroupInvite;
GO
CREATE PROCEDURE sp_SendGroupInvite
    @group_id INT,
    @sender_id INT,
    @receiver_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if sender is member
    IF NOT EXISTS (SELECT 1 FROM GroupMembers 
                   WHERE group_id = @group_id AND user_id = @sender_id)
    BEGIN
        SELECT 'You must be a group member to send invites' AS ErrorMessage;
        RETURN;
    END
    
    -- Check if receiver is already member
    IF EXISTS (SELECT 1 FROM GroupMembers 
               WHERE group_id = @group_id AND user_id = @receiver_id)
    BEGIN
        SELECT 'User is already a group member' AS ErrorMessage;
        RETURN;
    END
    
    -- Create group invite (using DirectMessages as a delivery mechanism)
    DECLARE @group_name NVARCHAR(100);
    SELECT @group_name = name FROM Groups WHERE id = @group_id;
    
    DECLARE @message NVARCHAR(MAX) = 'You have been invited to join group: ' + @group_name + 
                                     ' (Group ID: ' + CAST(@group_id AS NVARCHAR(10)) + ')';
    
    INSERT INTO DirectMessages (
        sender_id, receiver_id, content, content_type
    )
    VALUES (
        @sender_id, @receiver_id, @message, 'group_invite'
    );
    
    SELECT 'Group invite sent successfully' AS Result;
END;
GO

-- =============================================
-- Posts and Comments
-- =============================================

-- Create Post
DROP PROCEDURE IF EXISTS sp_CreatePost;
GO
CREATE PROCEDURE sp_CreatePost
    @user_id INT,
    @content NVARCHAR(MAX),
    @content_type NVARCHAR(50) = 'text',
    @media_url NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Posts (user_id, content, content_type, media_url)
    VALUES (@user_id, @content, @content_type, @media_url);
    
    DECLARE @post_id INT = SCOPE_IDENTITY();
    
    SELECT @post_id AS post_id, 'Post created successfully' AS Result;
END;
GO

-- Update Post
DROP PROCEDURE IF EXISTS sp_UpdatePost;
GO
CREATE PROCEDURE sp_UpdatePost
    @post_id INT,
    @user_id INT, -- Current user (for authorization)
    @content NVARCHAR(MAX),
    @content_type NVARCHAR(50) = NULL,
    @media_url NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check ownership
    IF NOT EXISTS (SELECT 1 FROM Posts WHERE id = @post_id AND user_id = @user_id)
    BEGIN
        SELECT 'You can only edit your own posts' AS ErrorMessage;
        RETURN;
    END
    
    -- Update post
    UPDATE Posts
    SET content = @content,
        content_type = ISNULL(@content_type, content_type),
        media_url = ISNULL(@media_url, media_url),
        updated_at = GETDATE()
    WHERE id = @post_id;
    
    SELECT 'Post updated successfully' AS Result;
END;
GO

-- Delete Post
DROP PROCEDURE IF EXISTS sp_DeletePost;
GO
CREATE PROCEDURE sp_DeletePost
    @post_id INT,
    @user_id INT -- Current user (for authorization)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if user is post owner or admin
    IF NOT EXISTS (SELECT 1 FROM Posts p 
                   INNER JOIN Users u ON p.user_id = u.id
                   WHERE p.id = @post_id AND (p.user_id = @user_id OR 
                                             (SELECT role FROM Users WHERE id = @user_id) = 'admin'))
    BEGIN
        SELECT 'You can only delete your own posts' AS ErrorMessage;
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    -- Delete all comments first
    DELETE FROM Comments WHERE post_id = @post_id;
    
    -- Delete post
    DELETE FROM Posts WHERE id = @post_id;
    
    COMMIT TRANSACTION;
    
    SELECT 'Post deleted successfully' AS Result;
END;
GO

-- Add Comment
DROP PROCEDURE IF EXISTS sp_AddComment;
GO
CREATE PROCEDURE sp_AddComment
    @post_id INT,
    @user_id INT,
    @content NVARCHAR(MAX),
    @content_type NVARCHAR(50) = 'text',
    @media_url NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if post exists
    IF NOT EXISTS (SELECT 1 FROM Posts WHERE id = @post_id)
    BEGIN
        SELECT 'Post does not exist' AS ErrorMessage;
        RETURN;
    END
    
    -- Add comment
    INSERT INTO Comments (post_id, user_id, content, content_type, media_url)
    VALUES (@post_id, @user_id, @content, @content_type, @media_url);
    
    DECLARE @comment_id INT = SCOPE_IDENTITY();
    
    SELECT @comment_id AS comment_id, 'Comment added successfully' AS Result;
END;
GO

-- Update Comment
DROP PROCEDURE IF EXISTS sp_UpdateComment;
GO
CREATE PROCEDURE sp_UpdateComment
    @comment_id INT,
    @user_id INT, -- Current user (for authorization)
    @content NVARCHAR(MAX),
    @content_type NVARCHAR(50) = NULL,
    @media_url NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check ownership
    IF NOT EXISTS (SELECT 1 FROM Comments WHERE id = @comment_id AND user_id = @user_id)
    BEGIN
        SELECT 'You can only edit your own comments' AS ErrorMessage;
        RETURN;
    END
    
    -- Update comment
    UPDATE Comments
    SET content = @content,
        content_type = ISNULL(@content_type, content_type),
        media_url = ISNULL(@media_url, media_url),
        updated_at = GETDATE()
    WHERE id = @comment_id;
    
    SELECT 'Comment updated successfully' AS Result;
END;
GO

-- Delete Comment
DROP PROCEDURE IF EXISTS sp_DeleteComment;
GO
CREATE PROCEDURE sp_DeleteComment
    @comment_id INT,
    @user_id INT -- Current user (for authorization)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if user is comment owner, post owner, or admin
    IF NOT EXISTS (
        SELECT 1 
        FROM Comments c
        LEFT JOIN Posts p ON c.post_id = p.id
        WHERE c.id = @comment_id AND 
              (c.user_id = @user_id OR 
               p.user_id = @user_id OR
               (SELECT role FROM Users WHERE id = @user_id) = 'admin')
    )
    BEGIN
        SELECT 'You don''t have permission to delete this comment' AS ErrorMessage;
        RETURN;
    END
    
    -- Delete comment
    DELETE FROM Comments WHERE id = @comment_id;
    
    SELECT 'Comment deleted successfully' AS Result;
END;
GO

-- Get Post with Comments
DROP PROCEDURE IF EXISTS sp_GetPostWithComments;
GO
CREATE PROCEDURE sp_GetPostWithComments
    @post_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get post details
    SELECT 
        p.id, p.content, p.content_type, p.media_url, 
        p.created_at, p.updated_at,
        u.id AS user_id, u.name AS user_name, 
        u.profile_image, up.nickname,
        (SELECT COUNT(*) FROM Comments WHERE post_id = p.id) AS comment_count,
        CASE WHEN u.role = 'counselor' THEN 1 ELSE 0 END AS is_counselor
    FROM Posts p
    INNER JOIN Users u ON p.user_id = u.id
    LEFT JOIN UserProfiles up ON u.id = up.user_id
    WHERE p.id = @post_id;
    
    -- Get comments
    SELECT 
        c.id, c.content, c.content_type, c.media_url, 
        c.created_at, c.updated_at,
        u.id AS user_id, u.name AS user_name, 
        u.profile_image, up.nickname,
        CASE WHEN u.role = 'counselor' THEN 1 ELSE 0 END AS is_counselor
    FROM Comments c
    INNER JOIN Users u ON c.user_id = u.id
    LEFT JOIN UserProfiles up ON u.id = up.user_id
    WHERE c.post_id = @post_id
    ORDER BY c.created_at;
END;
GO

-- Get User Timeline
DROP PROCEDURE IF EXISTS sp_GetUserTimeline;
GO
CREATE PROCEDURE sp_GetUserTimeline
    @user_id INT,
    @page INT = 1,
    @page_size INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @offset INT = (@page - 1) * @page_size;
    
    SELECT 
        p.id, p.content, p.content_type, p.media_url, 
        p.created_at, p.updated_at,
        u.id AS user_id, u.name AS user_name, 
        u.profile_image, up.nickname,
        (SELECT COUNT(*) FROM Comments WHERE post_id = p.id) AS comment_count,
        CASE WHEN u.role = 'counselor' THEN 1 ELSE 0 END AS is_counselor
    FROM Posts p
    INNER JOIN Users u ON p.user_id = u.id
    LEFT JOIN UserProfiles up ON u.id = up.user_id
    WHERE p.user_id = @user_id
    ORDER BY p.created_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @page_size ROWS ONLY;
END;
GO

-- Get Feed (Posts from friends and counselors)
DROP PROCEDURE IF EXISTS sp_GetFeed;
GO
CREATE PROCEDURE sp_GetFeed
    @user_id INT,
    @page INT = 1,
    @page_size INT = 10,
    @include_counselors BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @offset INT = (@page - 1) * @page_size;
    
    -- Get friends list
    CREATE TABLE #FriendIDs (user_id INT);
    
    INSERT INTO #FriendIDs
    SELECT friend_id FROM Friends WHERE user_id = @user_id
    UNION
    SELECT user_id FROM Friends WHERE friend_id = @user_id;
    
    -- Get counselors if requested
    IF @include_counselors = 1
    BEGIN
        INSERT INTO #FriendIDs
        SELECT id FROM Users 
        WHERE role = 'counselor' 
        AND id NOT IN (SELECT user_id FROM #FriendIDs);
    END
    
    -- Get posts
    SELECT 
        p.id, p.content, p.content_type, p.media_url, 
        p.created_at, p.updated_at,
        u.id AS user_id, u.name AS user_name, 
        u.profile_image, up.nickname,
        (SELECT COUNT(*) FROM Comments WHERE post_id = p.id) AS comment_count,
        CASE WHEN u.role = 'counselor' THEN 1 ELSE 0 END AS is_counselor,
        CASE WHEN f.user_id IS NOT NULL THEN 1 ELSE 0 END AS is_friend
    FROM Posts p
    INNER JOIN Users u ON p.user_id = u.id
    LEFT JOIN UserProfiles up ON u.id = up.user_id
    LEFT JOIN #FriendIDs f ON u.id = f.user_id
    WHERE p.user_id IN (SELECT user_id FROM #FriendIDs)
       OR p.user_id = @user_id -- Include user's own posts
    ORDER BY p.created_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @page_size ROWS ONLY;
    
    DROP TABLE #FriendIDs;
END;
GO

-- =============================================
-- Counselor-Specific Features
-- =============================================

-- Get Recommended Counselors
DROP PROCEDURE IF EXISTS sp_GetRecommendedCounselors;
GO
CREATE PROCEDURE sp_GetRecommendedCounselors
    @user_id INT,
    @limit INT = 5
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get existing connections to exclude
    CREATE TABLE #ExistingConnections (counselor_id INT);
    
    INSERT INTO #ExistingConnections
    SELECT id FROM Users
    WHERE role = 'counselor'
    AND (
        -- Already friends
        id IN (SELECT friend_id FROM Friends WHERE user_id = @user_id)
        OR id IN (SELECT user_id FROM Friends WHERE friend_id = @user_id)
        -- Pending requests
        OR id IN (SELECT receiver_id FROM FriendRequests 
                  WHERE sender_id = @user_id AND status = 'Pending')
        OR id IN (SELECT sender_id FROM FriendRequests 
                  WHERE receiver_id = @user_id AND status = 'Pending')
    );
    
    -- Get counselors with recent activity
    SELECT TOP (@limit)
        u.id, u.name, u.email, u.profile_image, 
        u.specialization, u.availability_schedule,
        up.nickname
    FROM Users u
    LEFT JOIN UserProfiles up ON u.id = up.user_id
    WHERE u.role = 'counselor'
    AND u.id NOT IN (SELECT counselor_id FROM #ExistingConnections)
    ORDER BY 
        -- This would ideally use some activity metrics, but for now we'll use random selection
        NEWID();
    
    DROP TABLE #ExistingConnections;
END;
GO

-- =============================================
-- Utility Procedures
-- =============================================

-- Search Users
DROP PROCEDURE IF EXISTS sp_SearchUsers;
GO
CREATE PROCEDURE sp_SearchUsers
    @query NVARCHAR(100),
    @user_id INT,
    @user_type NVARCHAR(50) = 'all', -- 'all', 'friends', 'counselors', 'seekers'
    @limit INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- For 'friends' option, get friends list
    CREATE TABLE #FriendIDs (user_id INT);
    
    IF @user_type = 'friends'
    BEGIN
        INSERT INTO #FriendIDs
        SELECT friend_id FROM Friends WHERE user_id = @user_id
        UNION
        SELECT user_id FROM Friends WHERE friend_id = @user_id;
    END
    
    -- Search users
    SELECT TOP (@limit)
        u.id, u.name, u.email, u.role, u.profile_image,
        u.specialization, u.faculty,
        up.nickname,
        CASE 
            WHEN f.id IS NOT NULL THEN 'friend'
            WHEN fr1.id IS NOT NULL THEN 'request_sent'
            WHEN fr2.id IS NOT NULL THEN 'request_received'
            ELSE 'not_connected'
        END AS connection_status,
        CASE WHEN u.role = 'counselor' THEN 1 ELSE 0 END AS is_counselor
    FROM Users u
    LEFT JOIN UserProfiles up ON u.id = up.user_id
    LEFT JOIN Friends f ON (f.user_id = @user_id AND f.friend_id = u.id) OR
                           (f.user_id = u.id AND f.friend_id = @user_id)
    LEFT JOIN FriendRequests fr1 ON fr1.sender_id = @user_id AND fr1.receiver_id = u.id
    LEFT JOIN FriendRequests fr2 ON fr2.sender_id = u.id AND fr2.receiver_id = @user_id
    WHERE u.id <> @user_id 
      AND (u.name LIKE '%' + @query + '%' 
           OR up.nickname LIKE '%' + @query + '%'
           OR u.email LIKE '%' + @query + '%')
      AND (@user_type = 'all'
           OR (@user_type = 'friends' AND u.id IN (SELECT user_id FROM #FriendIDs))
           OR (@user_type = 'counselors' AND u.role = 'counselor')
           OR (@user_type = 'seekers' AND u.role = 'seeker'))
    ORDER BY 
        CASE WHEN f.id IS NOT NULL THEN 0 ELSE 1 END, -- Prioritize friends
        CASE WHEN u.role = 'counselor' THEN 0 ELSE 1 END, -- Then counselors
        CASE WHEN u.name LIKE @query + '%' THEN 0 ELSE 1 END, -- Exact match first
        u.name;
    
    DROP TABLE #FriendIDs;
END;
GO

-- Send Emoji Reaction
DROP PROCEDURE IF EXISTS sp_SendEmojiReaction;
GO
CREATE PROCEDURE sp_SendEmojiReaction
    @user_id INT,
    @content_type NVARCHAR(50), -- 'post', 'comment', 'direct_message', 'group_message'
    @content_id INT,
    @emoji NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Create EmojiReactions table if it doesn't exist
    IF OBJECT_ID('EmojiReactions', 'U') IS NULL
    BEGIN
        CREATE TABLE EmojiReactions (
            id INT PRIMARY KEY IDENTITY(1,1),
            user_id INT NOT NULL,
            content_type NVARCHAR(50) NOT NULL,
            content_id INT NOT NULL, 
            emoji NVARCHAR(50) NOT NULL,
            created_at DATETIME DEFAULT GETDATE(),
            FOREIGN KEY (user_id) REFERENCES Users(id),
            UNIQUE (user_id, content_type, content_id, emoji)
        );
    END
    
    -- Delete existing emoji if it exists (toggle behavior)
    IF EXISTS (
        SELECT 1 FROM EmojiReactions
        WHERE user_id = @user_id 
          AND content_type = @content_type
          AND content_id = @content_id
          AND emoji = @emoji
    )
    BEGIN
        DELETE FROM EmojiReactions
        WHERE user_id = @user_id 
          AND content_type = @content_type
          AND content_id = @content_id
          AND emoji = @emoji;
          
        SELECT 'Emoji reaction removed' AS Result;
        RETURN;
    END
    
    -- Add new emoji reaction
    INSERT INTO EmojiReactions (user_id, content_type, content_id, emoji)
    VALUES (@user_id, @content_type, @content_id, @emoji);
    
    SELECT 'Emoji reaction added' AS Result;
END;
GO

-- Get Emoji Reactions
DROP PROCEDURE IF EXISTS sp_GetEmojiReactions;
GO
CREATE PROCEDURE sp_GetEmojiReactions
    @content_type NVARCHAR(50),
    @content_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF OBJECT_ID('EmojiReactions', 'U') IS NULL
    BEGIN
        SELECT 'No reactions' AS Result;
        RETURN;
    END
    
    -- Group by emoji and count
    SELECT 
        emoji,
        COUNT(*) AS count,
        STRING_AGG(CAST(user_id AS NVARCHAR(10)), ',') AS user_ids
    FROM EmojiReactions
    WHERE content_type = @content_type
      AND content_id = @content_id
    GROUP BY emoji
    ORDER BY count DESC;
END;
GO

-- =============================================
-- Analytics and Insights
-- =============================================

-- Get User Activity Statistics
DROP PROCEDURE IF EXISTS sp_GetUserActivityStats;
GO
CREATE PROCEDURE sp_GetUserActivityStats
    @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Posts and comments counts
    SELECT
        (SELECT COUNT(*) FROM Posts WHERE user_id = @user_id) AS post_count,
        (SELECT COUNT(*) FROM Comments WHERE user_id = @user_id) AS comment_count,
        (SELECT COUNT(*) FROM Friends 
         WHERE user_id = @user_id OR friend_id = @user_id) AS friend_count,
        (SELECT COUNT(*) FROM GroupMembers WHERE user_id = @user_id) AS group_count,
        (SELECT COUNT(*) FROM DirectMessages 
         WHERE sender_id = @user_id) AS messages_sent,
        (SELECT COUNT(*) FROM DirectMessages 
         WHERE receiver_id = @user_id) AS messages_received,
        (SELECT COUNT(*) FROM GroupMessages 
         WHERE sender_id = @user_id) AS group_messages_sent;
END;
GO

-- Get Mental Health Resources
DROP PROCEDURE IF EXISTS sp_GetMentalHealthResources;
GO
CREATE PROCEDURE sp_GetMentalHealthResources
    @category NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Create MentalHealthResources table if it doesn't exist
    IF OBJECT_ID('MentalHealthResources', 'U') IS NULL
    BEGIN
        CREATE TABLE MentalHealthResources (
            id INT PRIMARY KEY IDENTITY(1,1),
            title NVARCHAR(255) NOT NULL,
            description NVARCHAR(MAX),
            category NVARCHAR(100),
            url NVARCHAR(255),
            is_featured BIT DEFAULT 0,
            created_at DATETIME DEFAULT GETDATE(),
            updated_at DATETIME DEFAULT GETDATE()
        );
        
        -- Add some sample resources
        INSERT INTO MentalHealthResources (title, description, category, url, is_featured)
        VALUES 
        ('Coping with Stress', 'Resources for managing stress during studies', 'Stress', 'https://example.com/stress', 1),
        ('Depression Support', 'Support resources for depression', 'Depression', 'https://example.com/depression', 1),
        ('Anxiety Management', 'Techniques for managing anxiety', 'Anxiety', 'https://example.com/anxiety', 0),
        ('Sleep Hygiene', 'Improving sleep quality for better mental health', 'Sleep', 'https://example.com/sleep', 0),
        ('Mindfulness Practices', 'Introduction to mindfulness for mental wellness', 'Mindfulness', 'https://example.com/mindfulness', 1);
    END
    
    -- Get resources
    IF @category IS NULL
    BEGIN
        SELECT * FROM MentalHealthResources
        ORDER BY is_featured DESC, title;
    END
    ELSE
    BEGIN
        SELECT * FROM MentalHealthResources
        WHERE category = @category
        ORDER BY is_featured DESC, title;
    END
END;
GO

-- Recommendation Engine: Find Similar Users
DROP PROCEDURE IF EXISTS sp_FindSimilarUsers;
GO
CREATE PROCEDURE sp_FindSimilarUsers
    @user_id INT,
    @limit INT = 5
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get user's faculty
    DECLARE @user_faculty NVARCHAR(100);
    SELECT @user_faculty = faculty FROM Users WHERE id = @user_id;
    
    -- Get existing connections to exclude
    CREATE TABLE #ExistingConnections (user_id INT);
    
    INSERT INTO #ExistingConnections
    SELECT user_id FROM Friends WHERE friend_id = @user_id
    UNION
    SELECT friend_id FROM Friends WHERE user_id = @user_id
    UNION
    SELECT @user_id;
    
    -- Find similar users based on faculty and mutual friends
    WITH MutualFriends AS (
        -- Get user's friends
        SELECT friend_id AS friend_id FROM Friends WHERE user_id = @user_id
        UNION
        SELECT user_id AS friend_id FROM Friends WHERE friend_id = @user_id
    ),
    FriendsOfFriends AS (
        -- Get friends of user's friends
        SELECT f.friend_id AS potential_friend, COUNT(DISTINCT f.user_id) AS mutual_count
        FROM Friends f
        INNER JOIN MutualFriends mf ON f.user_id = mf.friend_id
        WHERE f.friend_id NOT IN (SELECT user_id FROM #ExistingConnections)
        GROUP BY f.friend_id
        
        UNION
        
        SELECT f.user_id AS potential_friend, COUNT(DISTINCT f.friend_id) AS mutual_count
        FROM Friends f
        INNER JOIN MutualFriends mf ON f.friend_id = mf.friend_id
        WHERE f.user_id NOT IN (SELECT user_id FROM #ExistingConnections)
        GROUP BY f.user_id
    )
    
    SELECT TOP (@limit)
        u.id, u.name, u.email, u.profile_image, u.faculty,
        fof.mutual_count,
        CASE 
            WHEN u.faculty = @user_faculty THEN 'Same faculty'
            ELSE 'Similar interests'
        END AS similarity_reason
    FROM FriendsOfFriends fof
    INNER JOIN Users u ON fof.potential_friend = u.id
    WHERE u.role = 'seeker' -- Only recommend seekers, not counselors
    ORDER BY 
        CASE WHEN u.faculty = @user_faculty THEN 1 ELSE 0 END DESC, -- Prioritize same faculty
        fof.mutual_count DESC; -- Then by mutual friends count
    
    DROP TABLE #ExistingConnections;
END;
GO