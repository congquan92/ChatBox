import { createContext, useEffect, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/hook/useAuth";

interface User {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string;
}

interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    contentType: "text" | "image" | "file" | "system";
    createdAt: string;
    editedAt?: string;
    sender: {
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
}

interface Conversation {
    id: number;
    type: "direct" | "group";
    title?: string;
    avatarUrl?: string;
    coverGifUrl?: string;
    label?: string;
    createdAt: string;
    creator: {
        id: number;
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
}

interface TypingUser {
    userId: number;
    username: string;
    displayName: string;
    conversationId: number;
}

interface CreateConversationData {
    type: "direct" | "group";
    title?: string;
    memberIds: number[];
    avatarUrl?: string;
    coverGifUrl?: string;
    label?: string;
}

interface MessageEditedData {
    messageId: number;
    content: string;
    editedAt: string;
    editedBy: {
        id: number;
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
}

interface MessageDeletedData {
    messageId: number;
    deletedBy: {
        id: number;
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
    deletedAt: string;
}

interface MessageReadData {
    messageId: number;
    readBy: {
        userId: number;
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
    timestamp: string;
}

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    onlineUsers: User[];
    typingUsers: TypingUser[];
    // Message events
    sendMessage: (conversationId: number, content: string, contentType?: string) => void;
    editMessage: (messageId: number, content: string) => void;
    deleteMessage: (messageId: number) => void;
    markMessageAsRead: (messageId: number) => void;
    // Conversation events
    createConversation: (data: CreateConversationData) => void;
    joinConversation: (conversationId: number) => void;
    leaveConversation: (conversationId: number) => void;
    // Typing events
    startTyping: (conversationId: number) => void;
    stopTyping: (conversationId: number) => void;
    // Event listeners
    onNewMessage: (callback: (message: Message) => void) => void;
    onMessageEdited: (callback: (data: MessageEditedData) => void) => void;
    onMessageDeleted: (callback: (data: MessageDeletedData) => void) => void;
    onMessageRead: (callback: (data: MessageReadData) => void) => void;
    onConversationCreated: (callback: (conversation: Conversation) => void) => void;
    onUserTyping: (callback: (user: TypingUser) => void) => void;
    onUserStopTyping: (callback: (user: TypingUser) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export { SocketContext };

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const { user, isAuthenticated } = useAuth();

    // Event listeners storage
    const eventListeners = {
        newMessage: [] as Array<(message: Message) => void>,
        messageEdited: [] as Array<(data: MessageEditedData) => void>,
        messageDeleted: [] as Array<(data: MessageDeletedData) => void>,
        messageRead: [] as Array<(data: MessageReadData) => void>,
        conversationCreated: [] as Array<(conversation: Conversation) => void>,
        userTyping: [] as Array<(user: TypingUser) => void>,
        userStopTyping: [] as Array<(user: TypingUser) => void>,
    };

    // Socket event functions
    const sendMessage = (conversationId: number, content: string, contentType: string = "text") => {
        if (socket) {
            socket.emit("send_message", { conversationId, content, contentType });
        }
    };

    const editMessage = (messageId: number, content: string) => {
        if (socket) {
            socket.emit("edit_message", { messageId, content });
        }
    };

    const deleteMessage = (messageId: number) => {
        if (socket) {
            socket.emit("delete_message", { messageId });
        }
    };

    const markMessageAsRead = (messageId: number) => {
        if (socket) {
            socket.emit("mark_message_read", { messageId });
        }
    };

    const createConversation = (data: CreateConversationData) => {
        if (socket) {
            socket.emit("create_conversation", data);
        }
    };

    const joinConversation = (conversationId: number) => {
        if (socket) {
            socket.emit("join_conversation", { conversationId });
        }
    };

    const leaveConversation = (conversationId: number) => {
        if (socket) {
            socket.emit("leave_conversation", { conversationId });
        }
    };

    const startTyping = (conversationId: number) => {
        if (socket) {
            socket.emit("typing_start", { conversationId });
        }
    };

    const stopTyping = (conversationId: number) => {
        if (socket) {
            socket.emit("typing_stop", { conversationId });
        }
    };

    // Event listener registration functions
    const onNewMessage = (callback: (message: Message) => void) => {
        eventListeners.newMessage.push(callback);
    };

    const onMessageEdited = (callback: (data: MessageEditedData) => void) => {
        eventListeners.messageEdited.push(callback);
    };

    const onMessageDeleted = (callback: (data: MessageDeletedData) => void) => {
        eventListeners.messageDeleted.push(callback);
    };

    const onMessageRead = (callback: (data: MessageReadData) => void) => {
        eventListeners.messageRead.push(callback);
    };

    const onConversationCreated = (callback: (conversation: Conversation) => void) => {
        eventListeners.conversationCreated.push(callback);
    };

    const onUserTyping = (callback: (user: TypingUser) => void) => {
        eventListeners.userTyping.push(callback);
    };

    const onUserStopTyping = (callback: (user: TypingUser) => void) => {
        eventListeners.userStopTyping.push(callback);
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            // Ngắt kết nối cũ nếu có
            if (socket) {
                socket.disconnect();
            }

            // Tạo kết nối socket với token authentication
            const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
                auth: { token: localStorage.getItem("token") || "" },
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 500,
            });

            // Basic connection events
            newSocket.on("connect", () => {
                console.log("Socket connected:", newSocket.id);
                setConnected(true);
                newSocket.emit("get_online_users");
            });

            newSocket.on("disconnect", () => {
                console.log("Socket disconnected");
                setConnected(false);
            });

            // Online users events
            newSocket.on("online_users", (users: User[]) => {
                console.log("Online users:", users);
                setOnlineUsers(users);
            });

            newSocket.on("user_online", (userData: { userId: number; username: string; displayName: string; avatarUrl?: string }) => {
                setOnlineUsers((prev) => {
                    const exists = prev.find((u) => u.id === userData.userId);
                    if (!exists) {
                        return [
                            ...prev,
                            {
                                id: userData.userId,
                                username: userData.username,
                                displayName: userData.displayName,
                                avatarUrl: userData.avatarUrl,
                            },
                        ];
                    }
                    return prev;
                });
            });

            newSocket.on("user_offline", (userData: { userId: number; username: string }) => {
                setOnlineUsers((prev) => prev.filter((u) => u.id !== userData.userId));
            });

            // Message events
            newSocket.on("new_message", (message: Message) => {
                eventListeners.newMessage.forEach((callback) => callback(message));
            });

            newSocket.on("message_edited", (data: MessageEditedData) => {
                eventListeners.messageEdited.forEach((callback) => callback(data));
            });

            newSocket.on("message_deleted", (data: MessageDeletedData) => {
                eventListeners.messageDeleted.forEach((callback) => callback(data));
            });

            newSocket.on("message_read", (data: MessageReadData) => {
                eventListeners.messageRead.forEach((callback) => callback(data));
            });

            // Conversation events
            newSocket.on("conversation_created", (conversation: Conversation) => {
                console.log("New conversation created:", conversation);
                eventListeners.conversationCreated.forEach((callback) => callback(conversation));
            });

            newSocket.on("joined_conversation", (data: unknown) => {
                console.log("Joined conversations:", data);
            });

            // Typing events
            newSocket.on("user_typing", (user: TypingUser) => {
                setTypingUsers((prev) => {
                    const exists = prev.find((u) => u.userId === user.userId && u.conversationId === user.conversationId);
                    if (!exists) {
                        return [...prev, user];
                    }
                    return prev;
                });
                eventListeners.userTyping.forEach((callback) => callback(user));
            });

            newSocket.on("user_stop_typing", (user: TypingUser) => {
                setTypingUsers((prev) => prev.filter((u) => !(u.userId === user.userId && u.conversationId === user.conversationId)));
                eventListeners.userStopTyping.forEach((callback) => callback(user));
            });

            newSocket.on("error", (error: unknown) => {
                console.error("Socket error:", error);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
                setConnected(false);
                setOnlineUsers([]);
                setTypingUsers([]);
            };
        } else {
            // Ngắt kết nối nếu không authenticated
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
                setOnlineUsers([]);
                setTypingUsers([]);
            }
        }
    }, [isAuthenticated, user]);

    const value = {
        socket,
        connected,
        onlineUsers,
        typingUsers,
        // Message functions
        sendMessage,
        editMessage,
        deleteMessage,
        markMessageAsRead,
        // Conversation functions
        createConversation,
        joinConversation,
        leaveConversation,
        // Typing functions
        startTyping,
        stopTyping,
        // Event listeners
        onNewMessage,
        onMessageEdited,
        onMessageDeleted,
        onMessageRead,
        onConversationCreated,
        onUserTyping,
        onUserStopTyping,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
