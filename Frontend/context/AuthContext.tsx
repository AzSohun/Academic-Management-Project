'use client';
import { api, setAccessToken } from "@/lib/api";
import { LoginDto, SignUpDto } from "@/types/auth";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface UserPayload {
    userId: string;
    email: string;
    role: 'Admin' | 'Teacher' | 'Student';
}

interface AuthContextType {
    user: UserPayload | null;
    token: string | null;
    isLoading: boolean;
    login: (data: LoginDto) => Promise<void>;
    signup: (data: SignUpDto) => Promise<void>;
    logout: () => Promise<void>;
}

const parseJwt = (token: string): UserPayload | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const parsed = JSON.parse(jsonPayload);
        return {
            userId: parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || parsed.sub,
            email: parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || parsed.email,
            role: parsed['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || parsed.role,
        };
    } catch {
        return null;
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserPayload | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const res = await axios.post<{ accessToken: string }>(
                    'https://localhost:7015/api/auth/refresh-token',
                    {},
                    { withCredentials: true }
                );
                const accessToken = res.data.accessToken;
                setToken(accessToken);
                setAccessToken(accessToken);
                const decodedUser = parseJwt(accessToken);
                setUser(decodedUser);
            } catch {
                setToken(null);
                setAccessToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    useEffect(() => {
        const publicPaths = ['/', '/login', '/signup'];

        if (!isLoading && user && publicPaths.includes(pathname)) {
            router.push("/dashboard");
        }
    }, [isLoading, user, pathname, router]);

    const login = async (credentials: LoginDto) => {
        const res = await api.post('/auth/login', credentials);
        const accessToken = res.data.accessToken;
        setToken(accessToken);
        setAccessToken(accessToken);
        const decodedUser = parseJwt(accessToken);
        setUser(decodedUser);
        router.push("/dashboard");
    };

    const signup = async (data: SignUpDto) => {
        await api.post('/auth/signup', data);
        router.push("/login");
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } finally {
            setToken(null);
            setAccessToken(null);
            setUser(null);
            router.push("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};