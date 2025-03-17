export interface CrisisCall {
    id: number;                             // Unique identifier for each call
    crisis_id: number;                      // ID of the associated crisis (references Crisis table)
    caller_id: number;                      // ID of the caller (seeker or counselor, references Users table)
    call_start: Date | null;                 // Call start time (can be null if not yet started)
    call_end: Date | null;                   // Call end time (can be null if call is ongoing)
    call_duration: number | null;            // Call duration in seconds (null if ongoing)
    call_type: string;                       // Type of call (e.g., 'Phone', 'Video')
    status: string;                          // Call status ('Ongoing', 'Completed')
  }
  