CREATE PROCEDURE GetOngoingCalls
AS
BEGIN
    -- Fetch all ongoing crisis calls from the CrisisCall table
    SELECT 
        id, 
        crisis_id, 
        caller_id, 
        call_start, 
        call_end, 
        call_duration, 
        call_type, 
        status
    FROM CrisisCall
    WHERE status = 'Ongoing';  -- Only fetch calls with status 'Ongoing'
END;
