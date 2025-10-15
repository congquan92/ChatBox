export interface APIMessage {
    id: number;
    conversationId: number;
    senderId: number;
    content: string;
    contentType: "text" | "image" | "file";
    createdAt: string; // ISO
    editedAt: string | null;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
}

export interface Message {
    id: number;
    content: string;
    createdAt: string; // ISO
    mine: boolean;
    username: string;
    displayName: string;
    avatarUrl?: string;
}

export function normalizeMessage(m: APIMessage, currentUsername: string): Message {
    return {
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        mine: m.username === currentUsername,
        username: m.username,
        displayName: m.displayName,
        avatarUrl: m.avatarUrl ?? undefined,
    };
}

// 6-API cho messages (6/6)

// Lấy messages trong conversation với phân trang
// export async function getConversationMessages(conversationId: number, page: number = 1, limit: number = 50, before?: string): Promise<APIMessage[] | null> {
//     try {
//         const params = new URLSearchParams({
//             page: page.toString(),
//             limit: limit.toString(),
//         });

//         if (before) {
//             params.append("before", before);
//         }

//         const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversation/${conversationId}?${params}`, {
//             method: "GET",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
//             },
//         });

//         if (response.ok) {
//             const data = await response.json();
//             return data as APIMessage[];
//         }
//         return null;
//     } catch (error) {
//         console.error("Error fetching messages:", error);
//         return null;
//     }
// }

export async function getConversationMessages(conversationId: number, page: number = 1, limit: number = 50, before?: string): Promise<APIMessage[]> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (before) params.append("before", before);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversation/${conversationId}?${params}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    // ⬅️ server trả { messages: [...] }
    return (data?.messages ?? []) as APIMessage[];
}

// Gửi tin nhắn (REST API backup, chủ yếu dùng socket)
export async function sendMessage(conversationId: number, content: string, contentType: string = "text") {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({
                conversationId,
                content,
                contentType,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error("Error sending message:", error);
        return null;
    }
}

// Chỉnh sửa tin nhắn
export async function editMessage(messageId: number, content: string) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({ content }),
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error("Error editing message:", error);
        return null;
    }
}

// Xóa tin nhắn
export async function deleteMessage(messageId: number) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error("Error deleting message:", error);
        return null;
    }
}

// Đánh dấu tin nhắn đã đọc
export async function markMessageAsRead(messageId: number) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}/read`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }
        return null;
    } catch (error) {
        console.error("Error marking message as read:", error);
        return null;
    }
}

//lấy chi tiết 1 tin nhắn
export async function getMessageById(messageId: number): Promise<Message | null> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });
        if (response.ok) {
            const data = await response.json();
            return data as Message;
        }
        return null;
    } catch (error) {
        console.error("Error fetching message by ID:", error);
        return null;
    }
}
