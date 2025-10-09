import { apiRequest } from "@/lib/api";

export interface Conversation {
    id: number;
    type: "direct" | "group";
    title?: string;
    label?: string;
    createdAt: string;
    lastMessage?: {
        id: number;
        content: string;
        contentType: string;
        createdAt: string;
        sender: {
            username: string;
            displayName: string;
        };
    };
    members: Array<{
        id: number;
        username: string;
        displayName: string;
    }>;
    unreadCount?: number;
}

export interface CreateConversationRequest {
    type: "direct" | "group";
    title?: string;
    label?: string;
    memberIds: number[];
}

export async function getUserConversations() {
    return apiRequest<Conversation[]>("/conversations");
}

export async function createConversation(data: CreateConversationRequest) {
    return apiRequest<{ id: number }>("/conversations", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getConversationById(conversationId: number) {
    return apiRequest<Conversation>(`/conversations/${conversationId}`);
}

export async function searchUsers(query: string) {
    console.log("Searching users with query:", query);
    return apiRequest<Array<{ id: number; username: string; displayName: string }>>(`/conversations/search/users?q=${encodeURIComponent(query)}`);
}

export async function addMember(conversationId: number, memberId: number) {
    return apiRequest(`/conversations/${conversationId}/members`, {
        method: "POST",
        body: JSON.stringify({ memberId }),
    });
}

export async function removeMember(conversationId: number, memberId: number) {
    return apiRequest(`/conversations/${conversationId}/members/${memberId}`, {
        method: "DELETE",
    });
}

export async function leaveConversation(conversationId: number) {
    return apiRequest(`/conversations/${conversationId}/leave`, {
        method: "POST",
    });
}
