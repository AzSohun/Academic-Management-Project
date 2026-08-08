export type Role = 'Admin' | 'Teacher' | 'Student';
export type Gender = 'Male' | 'Female';

export interface UserDto {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    role: Role,
    gender: Gender
}


export interface AuthResponse {
    accessToken: string,
    message: string
}

export interface LoginDto {
    email: string,
    password: string
}


export interface SignUpDto {
    firstName: string,
    lastName: string,
    email: string,
    password: string
    role: Role,
    gender: Gender
}