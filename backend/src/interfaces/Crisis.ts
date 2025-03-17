export interface Crisis {
    id: number;                             // Unique identifier for each crisis
    seeker_id: number;                      // ID of the seeker (user in crisis)
    counselor_id: number | null;             // ID of the assigned counselor (can be null until assigned)
    crisis_type: string;                     // Type of crisis (e.g., 'Panic Attack', 'Depression', 'Suicidal Thoughts')
    description: string | null;               // A detailed description of the crisis situation
    status: string;                          // Status of the crisis ('Pending', 'In Progress', 'Resolved')
    priority: number;                        // Crisis priority (1: Low, 2: Medium, 3: High)
    created_at: Date;                        // Timestamp when the crisis was reported
    updated_at: Date;                        // Timestamp when the record was last updated
    resolved_at: Date | null;                // Timestamp when the crisis was resolved (if applicable)
  }
  