export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    profile_image?: string;
    specialization?: string;
    faculty?: string;
    privileges?: string;
    availability_schedule?: string;
    nickname?: string;
    created_at?: Date;
    updated_at?: Date;
}