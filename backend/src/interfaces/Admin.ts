export interface Admin {
    id: number;                  // Unique identifier
    name: string;                // Full name of the admin
    email: string;               // Email address
    password?: string;           // Encrypted password (optional, for security reasons)
    role: 'admin';               // Fixed role for admins
    privileges?: string;         // List of specific privileges
    createdAt?: Date;            // Record creation timestamp
    updatedAt?: Date;            // Record last update timestamp
  }
  