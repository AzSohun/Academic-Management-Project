'use client';

import { api, setAccessToken } from "@/lib/api";
import { LoginDto, SignUpDto, UserDto } from "@/types/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";



export interface UserPayload {
    userId: string,
    email: string,
    role: 'Admin' | 'Teacher' | 'Student'
}



interface AuthContextType {
    user: UserDto | null,
    token: string | null,
    isLoading: boolean;
    login: (data: LoginDto) => Promise<void>,
    signup: (data: SignUpDto) => Promise<void>,
    logout: () => Promise<void>
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<UserDto | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {

        const initAuth = async () => {
            try {
                const res = await api.post('/auth/refresh-token');
                const accessToken = res.data.accessToken;
                setToken(accessToken);
                setAccessToken(accessToken);
                setUser(res.data.user)
            } catch (error) {
                setToken(null);
                setAccessToken(null);
            } finally {
                setIsLoading(false);
            }
        }

        initAuth();

    }, []);



    const login = async (credentials: LoginDto) => {
        const res = await api.post('/auth/login', credentials);
        const accessToken = res.data.accessToken;
        setToken(accessToken);
        setAccessToken(accessToken);

        setUser(user);

        router.push("/dashboard");
    }

    const signup = async (data: SignUpDto) => {
        const res = await api.post('/auth/signup', data);

        router.push("/login");
    }

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        }
        finally {
            setToken(null);
            setAccessToken(null);
            setUser(null);

            router.push("/login")
        }
    }

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>

    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("Invalid useAuth");
    }

    return context;
}



