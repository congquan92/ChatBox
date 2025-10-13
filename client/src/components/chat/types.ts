export interface Conversation {
    id: number | string;
    type: "direct" | "group";
    title?: string | null;
    avatarUrl?: string | null;
    coverGifUrl?: string | null;
    label?: string | null;
    createdAt: string;
    role: string;
    joinedAt: string | null;
    memberCount?: number | null;
    memberUsers?: string | null; // raw "nameA|nameB" cho direct
    lastMessage?: string | null;
    lastMessageTime?: string | null; // ISO
    lastMessageSender?: string | null;
}

export interface Message {
    id: string | number;
    conversationId: number;
    sender: string; // username
    content: string;
    createdAt: string; // ISO
}
