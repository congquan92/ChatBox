// Types for conversations
export interface Conversation {
    id: number;
    type: "direct" | "group";
    title?: string | null;
    avatarUrl?: string | null;
    coverGifUrl?: string | null;
    label?: "Chill" | "Work" | "Gaming" | "Study" | "Team" | "Family" | "Custom";
    createdAt: string;
    role: "member" | "admin";
    joinedAt: string;
    memberCount: number;
    lastMessage?: string | null;
    lastMessageTime?: string | null;
    lastMessageSender?: string | null;
    // Optional for detailed conversation data
    members?: ConversationMember[];
    updatedAt?: string;
}

export interface ConversationMember {
    id: number;
    userId: number;
    conversationId: number;
    role: "member" | "admin";
    joinedAt: string;
    user: {
        id: number;
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
}

export interface CreateConversationRequest {
    type: "direct" | "group";
    title?: string;
    memberIds: number[];
    avatarUrl?: string;
    coverGifUrl?: string;
    label?: "Chill" | "Work" | "Gaming" | "Study" | "Team" | "Family" | "Custom";
}

const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export async function getConversations(): Promise<{ ok: boolean; data?: Conversation[]; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function createConversation(conversationData: CreateConversationRequest): Promise<{ ok: boolean; data?: Conversation; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(conversationData),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error creating conversation:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function getConversationDetail(conversationId: number): Promise<{ ok: boolean; data?: Conversation; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error fetching conversation detail:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function updateConversation(
    conversationId: number,
    updateData: {
        title?: string;
        avatarUrl?: string;
        coverGifUrl?: string;
        label?: string;
    }
): Promise<{ ok: boolean; data?: Conversation; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error updating conversation:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function deleteConversation(conversationId: number): Promise<{ ok: boolean; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const data = await response.json();
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true };
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function addMemberToConversation(conversationId: number, userId: number, role: "member" | "admin" = "member"): Promise<{ ok: boolean; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}/members`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ userId, role }),
        });
        if (!response.ok) {
            const data = await response.json();
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true };
    } catch (error) {
        console.error("Error adding member:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function removeMemberFromConversation(conversationId: number, memberId: number): Promise<{ ok: boolean; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}/members/${memberId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const data = await response.json();
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true };
    } catch (error) {
        console.error("Error removing member:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function leaveConversation(conversationId: number): Promise<{ ok: boolean; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}/leave`, {
            method: "POST",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const data = await response.json();
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true };
    } catch (error) {
        console.error("Error leaving conversation:", error);
        return { ok: false, error: "Network error" };
    }
}
