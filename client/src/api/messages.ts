import { apiRequest } from "@/lib/api";

export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    contentType: "text" | "image" | "file";
    createdAt: string;
    updatedAt?: string;
    isEdited?: boolean;
    sender: {
        username: string;
        displayName: string;
    };
    readBy?: Array<{
        userId: number;
        username: string;
        displayName: string;
        readAt: string;
    }>;
}

export interface SendMessageRequest {
    conversationId: number;
    content: string;
    contentType?: "text" | "image" | "file";
}

export async function sendMessage(data: SendMessageRequest) {
    return apiRequest<Message>("/messages", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getMessages(conversationId: number, page = 1, limit = 50) {
    return apiRequest<{
        messages: Message[];
        hasMore: boolean;
        total: number;
    }>(`/messages/conversation/${conversationId}?page=${page}&limit=${limit}`);
}

export async function getMessageById(messageId: number) {
    return apiRequest<Message>(`/messages/${messageId}`);
}

export async function editMessage(messageId: number, content: string) {
    return apiRequest<Message>(`/messages/${messageId}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
    });
}

export async function deleteMessage(messageId: number) {
    return apiRequest(`/messages/${messageId}`, {
        method: "DELETE",
    });
}

export async function markAsRead(messageId: number) {
    return apiRequest(`/messages/${messageId}/read`, {
        method: "POST",
    });
}

export async function markAllAsRead(conversationId: number) {
    return apiRequest(`/messages/conversation/${conversationId}/read-all`, {
        method: "POST",
    });
}

export async function getUnreadCount(conversationId: number) {
    return apiRequest<{ unreadCount: number }>(`/messages/conversation/${conversationId}/unread-count`);
}

export async function searchMessages(conversationId: number, query: string) {
    return apiRequest<Message[]>(`/messages/conversation/${conversationId}/search?q=${encodeURIComponent(query)}`);
}
