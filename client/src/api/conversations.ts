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
    memberUsers: string;
    lastMessage: string;
    lastMessageTime: string;
    lastMessageSender: string;
}
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
