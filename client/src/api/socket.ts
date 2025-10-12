import { io, type Socket } from "socket.io-client";
import { type Message } from "@/api/message.api";
import { type Conversation, type CreateConversationRequest } from "@/api/conversation.api";

export interface SocketEvents {
    // Client to server events
    send_message: (data: { conversationId: number; content: string; contentType: string }) => void;
    edit_message: (messageId: number, content: string) => void;
    delete_message: (messageId: number) => void;
    mark_message_read: (messageId: number) => void;
    create_conversation: (data: CreateConversationRequest) => void;
    join_conversation: (conversationId: number) => void;
    leave_conversation: (conversationId: number) => void;
    typing_start: (conversationId: number) => void;
    typing_stop: (conversationId: number) => void;
    get_online_users: () => void;
    mark_conversation_read: (conversationId: number) => void;

    // Server to client events
    new_message: (message: Message) => void;
    message_edited: (message: Message) => void;
    message_deleted: (messageId: number) => void;
    message_read: (data: { messageId: number; userId: number }) => void;
    conversation_created: (conversation: Conversation) => void;
    user_typing: (data: { conversationId: number; username: string }) => void;
    user_stop_typing: (data: { conversationId: number; username: string }) => void;
    user_online: (username: string) => void;
    user_offline: (username: string) => void;
    online_users: (users: string[]) => void;
    error: (error: { message: string; code?: string }) => void;
    connect: () => void;
    disconnect: () => void;
}

type EventCallback = (...args: unknown[]) => void;

class SocketService {
    private socketInstance: Socket | null = null;
    private listeners: Map<string, EventCallback[]> = new Map();

    connect(token: string): Socket {
        if (this.socketInstance && this.socketInstance.connected) {
            return this.socketInstance;
        }

        this.socketInstance = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
            auth: {
                token,
            },
            transports: ["websocket", "polling"],
        });

        // Setup event handlers
        this.socketInstance.on("connect", () => {
            console.log("✅ Connected to socket server");
            this.emit("connect");
        });

        this.socketInstance.on("disconnect", (reason) => {
            console.log("❌ Disconnected from socket server:", reason);
            this.emit("disconnect");
        });

        this.socketInstance.on("connect_error", (error) => {
            console.error("🔌 Socket connection error:", error);
        });

        // Setup message event handlers
        this.socketInstance.on("new_message", (message: Message) => {
            console.log("📨 New message received:", message);
            this.emit("new_message", message);
        });

        this.socketInstance.on("message_edited", (message: Message) => {
            console.log("✏️ Message edited:", message);
            this.emit("message_edited", message);
        });

        this.socketInstance.on("message_deleted", (messageId: number) => {
            console.log("🗑️ Message deleted:", messageId);
            this.emit("message_deleted", messageId);
        });

        this.socketInstance.on("message_read", (data: { messageId: number; userId: number }) => {
            console.log("👁️ Message read:", data);
            this.emit("message_read", data);
        });

        // Setup conversation event handlers
        this.socketInstance.on("conversation_created", (conversation: Conversation) => {
            console.log("💬 Conversation created:", conversation);
            this.emit("conversation_created", conversation);
        });

        // Setup typing event handlers
        this.socketInstance.on("user_typing", (data: { conversationId: number; username: string }) => {
            console.log("⌨️ User typing:", data);
            this.emit("user_typing", data);
        });

        this.socketInstance.on("user_stop_typing", (data: { conversationId: number; username: string }) => {
            console.log("⌨️ User stop typing:", data);
            this.emit("user_stop_typing", data);
        });

        // Setup online status event handlers
        this.socketInstance.on("user_online", (username: string) => {
            console.log("🟢 User online:", username);
            this.emit("user_online", username);
        });

        this.socketInstance.on("user_offline", (username: string) => {
            console.log("🔴 User offline:", username);
            this.emit("user_offline", username);
        });

        this.socketInstance.on("online_users", (users: string[]) => {
            console.log("👥 Online users:", users);
            this.emit("online_users", users);
        });

        // Setup error handler
        this.socketInstance.on("error", (error: { message: string; code?: string }) => {
            console.error("🚨 Socket error:", error);
            this.emit("error", error);
        });

        return this.socketInstance;
    }

    disconnect(): void {
        if (this.socketInstance) {
            this.socketInstance.disconnect();
            this.socketInstance = null;
            this.listeners.clear();
        }
    }

    // Event listener management
    on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback as EventCallback);
    }

    off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
        if (!this.listeners.has(event)) return;

        const eventListeners = this.listeners.get(event)!;
        if (callback) {
            const index = eventListeners.indexOf(callback as EventCallback);
            if (index > -1) {
                eventListeners.splice(index, 1);
            }
        } else {
            this.listeners.set(event, []);
        }
    }

    private emit(event: string, ...args: unknown[]): void {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.forEach((callback) => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`Error in socket event handler for ${event}:`, error);
                }
            });
        }
    }

    // Message methods
    sendMessage(conversationId: number, content: string, contentType: string = "text"): void {
        this.socketInstance?.emit("send_message", { conversationId, content, contentType });
    }

    editMessage(messageId: number, content: string): void {
        this.socketInstance?.emit("edit_message", messageId, content);
    }

    deleteMessage(messageId: number): void {
        this.socketInstance?.emit("delete_message", messageId);
    }

    markMessageAsRead(messageId: number): void {
        this.socketInstance?.emit("mark_message_read", messageId);
    }

    // Conversation methods
    joinConversation(conversationId: number): void {
        this.socketInstance?.emit("join_conversation", conversationId);
    }

    leaveConversation(conversationId: number): void {
        this.socketInstance?.emit("leave_conversation", conversationId);
    }

    markConversationAsRead(conversationId: number): void {
        this.socketInstance?.emit("mark_conversation_read", conversationId);
    }

    // Typing methods
    startTyping(conversationId: number): void {
        this.socketInstance?.emit("typing_start", conversationId);
    }

    stopTyping(conversationId: number): void {
        this.socketInstance?.emit("typing_stop", conversationId);
    }

    // Online users
    getOnlineUsers(): void {
        this.socketInstance?.emit("get_online_users");
    }

    // Connection status
    get isConnected(): boolean {
        return this.socketInstance?.connected || false;
    }

    get socket(): Socket | null {
        return this.socketInstance;
    }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
