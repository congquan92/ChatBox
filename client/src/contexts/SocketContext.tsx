import { createContext, useEffect, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    onlineUsers: Array<{ id: number; username: string; displayName: string }>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export { SocketContext };

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Array<{ id: number; username: string; displayName: string }>>([]);
    const { token, user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && token && user) {
            // Ngắt kết nối cũ nếu có
            if (socket) {
                socket.disconnect();
            }

            // Tạo kết nối socket với token authentication
            const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", {
                auth: { token },
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 500,
            });

            // Lắng nghe các events
            newSocket.on("connect", () => {
                console.log("Socket connected:", newSocket.id);
                setConnected(true);

                // Lấy danh sách users online
                newSocket.emit("get_online_users");
            });

            newSocket.on("disconnect", () => {
                console.log("Socket disconnected");
                setConnected(false);
            });

            newSocket.on("online_users", (users) => {
                setOnlineUsers(users);
            });

            newSocket.on("user_online", (userData) => {
                setOnlineUsers((prev) => {
                    const exists = prev.find((u) => u.id === userData.userId);
                    if (!exists) {
                        return [
                            ...prev,
                            {
                                id: userData.userId,
                                username: userData.username,
                                displayName: userData.displayName,
                            },
                        ];
                    }
                    return prev;
                });
            });

            newSocket.on("user_offline", (userData) => {
                setOnlineUsers((prev) => prev.filter((u) => u.id !== userData.userId));
            });

            newSocket.on("error", (error) => {
                console.error("Socket error:", error);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
                setConnected(false);
                setOnlineUsers([]);
            };
        } else {
            // Ngắt kết nối nếu không authenticated
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
                setOnlineUsers([]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, token, user?.id]);

    const value = {
        socket,
        connected,
        onlineUsers,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
