import { createContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

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
    isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMe = async () => {
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
                    // console.log("Mã Token đã hết hạn hoặc không hợp lệ");
                    console.log(data.message);
                    navigate("/", { replace: true });
                    return;
                }
                setUser(data.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchMe();
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        window.location.href = "/login";
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
        isAuthenticated: !!user,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
