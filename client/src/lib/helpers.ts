// Helper function để decode JWT token
export function decodeJWTToken(token: string) {
    try {
        // Decode JWT token không cần verify (vì server đã verify)
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
            throw new Error("Invalid token format");
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        return payload;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}

// Helper function để format time
export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
        return "Vừa xong";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} giờ trước`;
    } else {
        return date.toLocaleDateString("vi-VN");
    }
}

// Helper function để truncate text
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
}

// Helper function để validate email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function để generate conversation name
export function getConversationDisplayName(conversation: { type: string; title?: string; members: Array<{ username: string; displayName: string }> }, currentUsername?: string): string {
    if (conversation.title) return conversation.title;

    if (conversation.type === "private" && conversation.members.length === 2) {
        const otherMember = conversation.members.find((m) => m.username !== currentUsername);
        return otherMember?.displayName || otherMember?.username || "Unknown User";
    }

    return `Nhóm ${conversation.members.length} người`;
}
