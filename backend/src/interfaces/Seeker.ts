export interface Seeker {
  id: number;                  // Unique identifier
  name: string;                // Full name of the seeker
  email: string;               // Email address
  password?: string;           // Encrypted password (optional, for security reasons)
  role: 'seeker';              // Fixed role for seekers
  faculty?: string;            // Faculty of the seeker (if applicable)
  profileImage?: string;       // URL to the seeker's profile image
  wantsDailyEmails?: boolean;  // Whether the seeker wants daily email notifications
  createdAt?: Date;            // Record creation timestamp
  updatedAt?: Date;            // Record last update timestamp
}
