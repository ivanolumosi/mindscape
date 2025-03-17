export interface Counselor {
    id: number;                  // Unique identifier
    name: string;                // Full name of the counselor
    email: string;               // Email address
    password?: string;           // Encrypted password (optional, for security reasons)
    role: 'counselor';           // Fixed role for counselors
    profileImage?: string;       // URL to the profile picture
    specialization?: string;     // Area of expertise
    availabilitySchedule?: string; // Counselor's availability schedule (optional)
    createdAt?: Date;            // Record creation timestamp
    updatedAt?: Date;            // Record last update timestamp
  }
  