// src/context/SocketContext.tsx
import { createContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/hook/useAuth";

// ====== Types ======
export interface OnlineUser {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string;
}

export interface OutgoingMessagePayload {
    conversationId: number;
    content: string;
    contentType?: "text" | "image" | "file" | "emoji";
}

export interface EditMessagePayload {
    messageId: number;
    content: string;
}

export interface DeleteMessagePayload {
    messageId: number;
}

export interface ReadMessagePayload {
    messageId: number;
}

export interface CreateConversationPayload {
    type: "direct" | "group";
    title?: string | null;
    memberIds: number[];
    avatarUrl?: string | null;
    coverGifUrl?: string | null;
    label?: "Chill" | "Work" | "Gaming" | "Study" | "Team" | "Family" | "Custom";
}

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    onlineUsers: OnlineUser[];
    // Rooms
    joinConversation: (conversationId: number) => void;
    leaveConversation: (conversationId: number) => void;
    // Conversations
    createConversation: (payload: CreateConversationPayload) => void;
    // Messages
    sendMessage: (payload: OutgoingMessagePayload) => void;
    editMessage: (payload: EditMessagePayload) => void;
    deleteMessage: (payload: DeleteMessagePayload) => void;
    markMessageRead: (payload: ReadMessagePayload) => void;
    // Typing
    startTyping: (conversationId: number) => void;
    stopTyping: (conversationId: number) => void;
    // Utils
    refreshOnlineUsers: () => void;
    // Ephemeral states to render UI
    typingUsersByConversation: Record<number, Record<number, { userId: number; username: string; displayName: string }>>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);
export { SocketContext };

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const typingUsersRef = useRef<SocketContextType["typingUsersByConversation"]>({});
    const [typingUsersByConversation, setTypingUsersByConversation] = useState(typingUsersRef.current);

    // keep a stable token getter (phòng khi bạn rotate token)
    const tokenRef = useRef<string | null>(null);
    useEffect(() => {
        tokenRef.current = localStorage.getItem("token");
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            // logout / guest => clean
            if (socket) socket.disconnect();
            setSocket(null);
            setConnected(false);
            setOnlineUsers([]);
            typingUsersRef.current = {};
            setTypingUsersByConversation({});
            return;
        }

        // Nếu đã có kết nối cũ thì ngắt trước khi tạo mới
        if (socket) socket.disconnect();

        const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
            auth: { token: tokenRef.current || "" },
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 500,
            timeout: 15000,
            transports: ["websocket"], // ép WS cho mượt (tùy hạ tầng)
        });

        // ---- Core lifecycle
        const onConnect = () => {
            console.log("[socket] connected:", newSocket.id);
            setConnected(true);
            // xin danh sách online
            newSocket.emit("get_online_users");
        };

        const onDisconnect = (reason: string) => {
            console.log("[socket] disconnected:", reason);
            setConnected(false);
            // clear typing ephemeral (tránh kẹt UI)
            typingUsersRef.current = {};
            setTypingUsersByConversation({});
        };

        const onError = (err: any) => {
            console.error("[socket] error:", err);
        };

        // ---- Online users
        const onOnlineUsers = (users: OnlineUser[]) => {
            setOnlineUsers(users);
        };

        const onUserOnline = (userData: any) => {
            setOnlineUsers((prev) => {
                if (prev.some((u) => u.id === userData.userId)) return prev;
                return [
                    ...prev,
                    {
                        id: userData.userId,
                        username: userData.username,
                        displayName: userData.displayName,
                        avatarUrl: userData.avatarUrl,
                    },
                ];
            });
        };

        const onUserOffline = (userData: any) => {
            setOnlineUsers((prev) => prev.filter((u) => u.id !== userData.userId));
        };

        // ---- Conversation events (server emit)
        const onJoinedConversation = (data: { user: any; conversations: Array<{ id: number }> }) => {
            // Bạn có thể cache danh sách conv ở đây nếu muốn.
            // console.log("[socket] joined_conversation", data);
        };

        const onConversationCreated = (payload: any) => {
            // payload: { conversation, creator }
            console.log("[socket] conversation_created:", payload);
            // optional: toast, hoặc trigger refetch list conv
        };

        // ---- Message events (server emit)
        const onNewMessage = (messageData: any) => {
            // gợi ý: phát custom event để những component khác lắng nghe
            window.dispatchEvent(new CustomEvent("socket:new_message", { detail: messageData }));
        };

        const onMessageEdited = (data: any) => {
            window.dispatchEvent(new CustomEvent("socket:message_edited", { detail: data }));
        };

        const onMessageDeleted = (data: any) => {
            window.dispatchEvent(new CustomEvent("socket:message_deleted", { detail: data }));
        };

        const onMessageRead = (data: any) => {
            window.dispatchEvent(new CustomEvent("socket:message_read", { detail: data }));
        };

        // ---- Typing events (server emit)
        const onUserTyping = (data: { userId: number; username: string; displayName: string; conversationId: number }) => {
            const { conversationId, userId } = data;
            const byConv = typingUsersRef.current[conversationId] || {};
            byConv[userId] = { userId, username: data.username, displayName: data.displayName };
            typingUsersRef.current = { ...typingUsersRef.current, [conversationId]: { ...byConv } };
            setTypingUsersByConversation({ ...typingUsersRef.current });
        };

        const onUserStopTyping = (data: { userId: number; conversationId: number }) => {
            const { conversationId, userId } = data;
            const byConv = { ...(typingUsersRef.current[conversationId] || {}) };
            delete byConv[userId];
            typingUsersRef.current = { ...typingUsersRef.current, [conversationId]: byConv };
            setTypingUsersByConversation({ ...typingUsersRef.current });
        };

        // ---- Bind listeners
        newSocket.on("connect", onConnect);
        newSocket.on("disconnect", onDisconnect);
        newSocket.on("error", onError);

        newSocket.on("online_users", onOnlineUsers);
        newSocket.on("user_online", onUserOnline);
        newSocket.on("user_offline", onUserOffline);

        newSocket.on("joined_conversation", onJoinedConversation);
        newSocket.on("conversation_created", onConversationCreated);

        newSocket.on("new_message", onNewMessage);
        newSocket.on("message_edited", onMessageEdited);
        newSocket.on("message_deleted", onMessageDeleted);
        newSocket.on("message_read", onMessageRead);

        newSocket.on("user_typing", onUserTyping);
        newSocket.on("user_stop_typing", onUserStopTyping);

        // ---- Mount
        setSocket(newSocket);

        // ---- Cleanup
        return () => {
            newSocket.off("connect", onConnect);
            newSocket.off("disconnect", onDisconnect);
            newSocket.off("error", onError);

            newSocket.off("online_users", onOnlineUsers);
            newSocket.off("user_online", onUserOnline);
            newSocket.off("user_offline", onUserOffline);

            newSocket.off("joined_conversation", onJoinedConversation);
            newSocket.off("conversation_created", onConversationCreated);

            newSocket.off("new_message", onNewMessage);
            newSocket.off("message_edited", onMessageEdited);
            newSocket.off("message_deleted", onMessageDeleted);
            newSocket.off("message_read", onMessageRead);

            newSocket.off("user_typing", onUserTyping);
            newSocket.off("user_stop_typing", onUserStopTyping);

            newSocket.disconnect();
            setSocket(null);
            setConnected(false);
            setOnlineUsers([]);
            typingUsersRef.current = {};
            setTypingUsersByConversation({});
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user]);

    // ====== Emit helpers (khớp server) ======
    const joinConversation = (conversationId: number) => {
        socket?.emit("join_conversation", { conversationId });
    };

    const leaveConversation = (conversationId: number) => {
        socket?.emit("leave_conversation", { conversationId });
    };

    const createConversation = (payload: CreateConversationPayload) => {
        socket?.emit("create_conversation", payload);
    };

    const sendMessage = (payload: OutgoingMessagePayload) => {
        // server requires: conversationId + content (+ contentType)
        socket?.emit("send_message", payload);
    };

    const editMessage = (payload: EditMessagePayload) => {
        socket?.emit("edit_message", payload);
    };

    const deleteMessage = (payload: DeleteMessagePayload) => {
        socket?.emit("delete_message", payload);
    };

    const markMessageRead = (payload: ReadMessagePayload) => {
        socket?.emit("mark_message_read", payload);
    };

    const startTyping = (conversationId: number) => {
        socket?.emit("typing_start", { conversationId });
    };

    const stopTyping = (conversationId: number) => {
        socket?.emit("typing_stop", { conversationId });
    };

    const refreshOnlineUsers = () => {
        socket?.emit("get_online_users");
    };

    const value: SocketContextType = useMemo(
        () => ({
            socket,
            connected,
            onlineUsers,
            joinConversation,
            leaveConversation,
            createConversation,
            sendMessage,
            editMessage,
            deleteMessage,
            markMessageRead,
            startTyping,
            stopTyping,
            refreshOnlineUsers,
            typingUsersByConversation,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [socket, connected, onlineUsers, typingUsersByConversation]
    );

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
