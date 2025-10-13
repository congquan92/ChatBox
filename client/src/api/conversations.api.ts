export interface Conversation {
    id: number;
    type: "direct" | "group";
    title?: string;
    avatarUrl?: string;
    coverGifUrl?: string;
    label?: string;
    createdAt: string;
    role: string;
    joinedAt: string;
    memberCount: number;
    lastMessage: string;
    lastMessageTime: string;
    lastMessageSender: string;
    members?: ConversationMember[];
}

export interface ConversationMember {
    userId: number;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    role: "member" | "admin";
    joinedAt: string;
}

export interface CreateConversationData {
    type: "direct" | "group";
    title?: string;
    memberIds: number[];
    avatarUrl?: string;
    coverGifUrl?: string;
    label?: "Chill" | "Work" | "Gaming" | "Study" | "Team" | "Family" | "Custom";
}

export interface UpdateConversationData {
    title?: string;
    avatarUrl?: string;
    coverGifUrl?: string;
    label?: string;
}

// 8-API cho conversations (8/8)

// GET /conversations
export async function getUserConversations() {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });
        if (response.ok) {
            const data = await response.json();
            return data.conversations as Conversation[];
        }
        return []; // Trả về mảng rỗng nếu không thành công
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}

// GET /conversations/:id
export async function getConversationById(conversationId: number) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });
        if (response.ok) {
            const data = await response.json();
            return data.conversation as Conversation;
        }
        return null;
    } catch (error) {
        console.error("Error fetching conversation by ID:", error);
        return null;
    }
}

// POST /conversations
export async function createConversation(conversationData: CreateConversationData): Promise<Conversation | null> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify(conversationData),
        });

        if (response.ok) {
            const data = await response.json();
            return data as Conversation;
        }
        return null;
    } catch (error) {
        console.error("Error creating conversation:", error);
        return null;
    }
}

// PUT /conversations/:id
export async function updateConversation(conversationId: number, updateData: UpdateConversationData): Promise<boolean> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify(updateData),
        });

        return response.ok;
    } catch (error) {
        console.error("Error updating conversation:", error);
        return false;
    }
}

// DELETE /conversations/:id
export async function deleteConversation(conversationId: number): Promise<boolean> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        return response.ok;
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return false;
    }
}

// POST /conversations/:id/members
export async function addMemberToConversation(conversationId: number, userId: number, role: "member" | "admin" = "member"): Promise<boolean> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}/members`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({ userId, role }),
        });

        return response.ok;
    } catch (error) {
        console.error("Error adding member:", error);
        return false;
    }
}

// DELETE /conversations/:id/members/:memberId
export async function removeMemberFromConversation(conversationId: number, memberId: number): Promise<boolean> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}/members/${memberId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        return response.ok;
    } catch (error) {
        console.error("Error removing member:", error);
        return false;
    }
}

// POST /conversations/:id/leave
export async function leaveConversation(conversationId: number): Promise<boolean> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}/leave`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        return response.ok;
    } catch (error) {
        console.error("Error leaving conversation:", error);
        return false;
    }
}
