// Types for messages
export interface Message {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    contentType: "text" | "image" | "file" | "system";
    createdAt: string;
    updatedAt: string;
    editedAt?: string;
    sender: {
        id: number;
        username: string;
        displayName: string;
        avatarUrl?: string;
    };
}

export interface SendMessageRequest {
    conversationId: number;
    content: string;
    contentType: "text" | "image" | "file" | "system";
}

export interface GetMessagesParams {
    page?: number;
    limit?: number;
    before?: string; // timestamp
}

const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export async function sendMessage(messageData: SendMessageRequest): Promise<{ ok: boolean; data?: Message; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(messageData),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error sending message:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function getMessages(conversationId: number, params: GetMessagesParams = {}): Promise<{ ok: boolean; data?: Message[]; error?: string; hasMore?: boolean; nextPage?: number }> {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", params.page.toString());
        if (params.limit) queryParams.set("limit", params.limit.toString());
        if (params.before) queryParams.set("before", params.before);

        const url = `${import.meta.env.VITE_API_URL}/messages/conversation/${conversationId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

        const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return {
            ok: true,
            data: data.data || data.messages || data,
            hasMore: data.hasMore,
            nextPage: data.nextPage,
        };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function getMessageById(messageId: number): Promise<{ ok: boolean; data?: Message; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error fetching message:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function editMessage(messageId: number, content: string): Promise<{ ok: boolean; data?: Message; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ content }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error editing message:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function deleteMessage(messageId: number): Promise<{ ok: boolean; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const data = await response.json();
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true };
    } catch (error) {
        console.error("Error deleting message:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function markMessageAsRead(messageId: number): Promise<{ ok: boolean; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}/read`, {
            method: "POST",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const data = await response.json();
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true };
    } catch (error) {
        console.error("Error marking message as read:", error);
        return { ok: false, error: "Network error" };
    }
}
