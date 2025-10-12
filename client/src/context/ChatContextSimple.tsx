import { createContext, type ReactNode } from "react";
import { type Conversation } from "@/api/conversation.api";
import { type Message } from "@/api/message.api";
import { type Socket } from "socket.io-client";

interface ChatContextType {
    // Conversations
    conversations: Conversation[];
    selectedConversationId: number | null;
    selectedConversation: Conversation | null;
    setSelectedConversationId: (id: number | null) => void;
    refreshConversations: () => Promise<void>;

    // Messages
    messages: Message[];
    sendMessage: (content: string, contentType?: "text" | "image" | "file") => Promise<void>;
    loadMoreMessages: () => Promise<void>;
    hasMoreMessages: boolean;
    messagesLoading: boolean;

    // Socket
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: string[];

    // Typing
    typingUsers: { [conversationId: number]: string[] };
    startTyping: (conversationId: number) => void;
    stopTyping: (conversationId: number) => void;

    // Unread counts
    unreadCounts: { [conversationId: number]: number };
    markConversationAsRead: (conversationId: number) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

// This will be a simple context provider for now
export function ChatProvider({ children }: { children: ReactNode }) {
    // Mock implementation - will be updated in the full chat component
    const value: ChatContextType = {
        conversations: [],
        selectedConversationId: null,
        selectedConversation: null,
        setSelectedConversationId: () => {},
        refreshConversations: async () => {},

        messages: [],
        sendMessage: async () => {},
        loadMoreMessages: async () => {},
        hasMoreMessages: false,
        messagesLoading: false,

        socket: null,
        isConnected: false,
        onlineUsers: [],

        typingUsers: {},
        startTyping: () => {},
        stopTyping: () => {},

        unreadCounts: {},
        markConversationAsRead: () => {},
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
