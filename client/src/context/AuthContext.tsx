import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface User {
    userName: string;
    email: string;
    displayName: string;
    avatarUrl: string;
}
interface AuthContextType {
    user: User | null;
    logout: () => void;
    refreshUser: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchdata = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/me`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = await res.json();
                if (!res.ok) {
                    localStorage.removeItem("token");
                    setUser(null);
                    console.log("Mã Token đã hết hạn hoặc không hợp lệ");
                    return;
                }
                setUser(data.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchdata();
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const refreshUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            return;
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                localStorage.removeItem("token");
                setUser(null);
                return;
            }
            setUser(data.data);
        } catch (e) {
            console.log(e);
        }
    };

    const value = {
        user,
        logout,
        refreshUser,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error("useAuthContext phải được sử dụng trong AuthProvider");
    return context;
}
