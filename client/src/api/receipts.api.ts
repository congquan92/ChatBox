export interface MessageReceipt {
    messageId: number;
    userId: number;
    status: "delivered" | "read";
    timestamp: string;
    user: {
        username: string;
        displayName: string;
        avatarUrl: string | null;
    };
}

export interface UnreadMessage {
    conversationId: number;
    messageId: number;
    senderId: number;
    content: string;
    createdAt: string;
    sender: {
        username: string;
        displayName: string;
        avatarUrl: string | null;
    };
}

export interface UnreadCount {
    conversationId: number;
    unreadCount: number;
    lastMessageTime: string;
}

// Lấy receipt cho một tin nhắn
export async function getMessageReceipts(messageId: number): Promise<MessageReceipt[]> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/receipts/message/${messageId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.receipts as MessageReceipt[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching message receipts:", error);
        return [];
    }
}

// Lấy tất cả tin nhắn chưa đọc
export async function getUnreadMessages(): Promise<UnreadMessage[]> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/receipts/unread`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.messages as UnreadMessage[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching unread messages:", error);
        return [];
    }
}

// Đánh dấu tất cả tin nhắn trong conversation đã đọc
export async function markConversationAsRead(conversationId: number): Promise<boolean> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/receipts/conversation/${conversationId}/read-all`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        return response.ok;
    } catch (error) {
        console.error("Error marking conversation as read:", error);
        return false;
    }
}

// Lấy số tin nhắn chưa đọc theo từng conversation
export async function getUnreadCounts(): Promise<UnreadCount[]> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/receipts/unread-count`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.counts as UnreadCount[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching unread counts:", error);
        return [];
    }
}
