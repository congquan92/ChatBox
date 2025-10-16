// Re-export types from API for convenience
export type { Conversation, ConversationMember } from "@/api/conversations.api";
export type { Message, APIMessage } from "@/api/messages.api";
export type { User } from "@/api/profile.api";
export type { MessageReceipt, UnreadCount } from "@/api/receipts.api";

export interface newMessage {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    contentType: "text" | "image" | "file" | "system";
    createdAt: string;
    sender: {
        username: string;
        displayName: string;
        avatarUrl: string;
    };
}
