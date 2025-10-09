import { useState } from "react";
import { type Conversation } from "@/api/conversations";
import { Button } from "@/components/ui/button";
import NewConversationModal from "./NewConversationModal";

interface ConversationListProps {
    conversations: Conversation[];
    activeConversationId: number | null;
    onSelectConversation: (id: number) => void;
    onConversationUpdate: () => void;
}

export default function ConversationList({ conversations, activeConversationId, onSelectConversation, onConversationUpdate }: ConversationListProps) {
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        } else if (diffInHours < 24 * 7) {
            return date.toLocaleDateString("vi-VN", { weekday: "short" });
        } else {
            return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        }
    };

    const getConversationName = (conversation: Conversation) => {
        if (conversation.title) return conversation.title;

        // Kiểm tra an toàn cho members
        if (!conversation.members || !Array.isArray(conversation.members)) {
            return "Cuộc trò chuyện";
        }

        if (conversation.type === "direct" && conversation.members.length === 2) {
            // Trong conversation direct, hiển thị tên của người kia
            const otherMember = conversation.members.find((m) => m.username !== localStorage.getItem("username"));
            return otherMember?.displayName || otherMember?.username || "Unknown";
        }
        return `Nhóm ${conversation.members.length} người`;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Tin nhắn</h2>
                    <Button size="sm" variant="outline" onClick={() => setShowNewConversationModal(true)}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Mới
                    </Button>
                </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                        <div className="text-4xl mb-2">💬</div>
                        <div>Chưa có cuộc trò chuyện nào</div>
                        <Button size="sm" variant="outline" className="mt-2" onClick={() => setShowNewConversationModal(true)}>
                            Tạo cuộc trò chuyện đầu tiên
                        </Button>
                    </div>
                ) : (
                    conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            className={`p-4 cursor-pointer hover:bg-accent transition-colors border-b last:border-b-0 ${activeConversationId === conversation.id ? "bg-accent" : ""}`}
                            onClick={() => onSelectConversation(conversation.id)}
                        >
                            <div className="flex items-start space-x-3">
                                {/* Avatar */}
                                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                    {conversation.type === "group" ? (
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                        </svg>
                                    ) : (
                                        getConversationName(conversation).charAt(0).toUpperCase()
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium truncate">{getConversationName(conversation)}</h3>
                                        {conversation.lastMessage && <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{formatTime(conversation.lastMessage.createdAt)}</span>}
                                    </div>

                                    {conversation.lastMessage ? (
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground truncate">
                                                <span className="font-medium">{conversation.lastMessage.sender.displayName}:</span>
                                                {" " + conversation.lastMessage.content}
                                            </p>
                                            {conversation.unreadCount && conversation.unreadCount > 0 && <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">{conversation.unreadCount}</span>}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Chưa có tin nhắn</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* New Conversation Modal */}
            {showNewConversationModal && (
                <NewConversationModal
                    onClose={() => setShowNewConversationModal(false)}
                    onSuccess={() => {
                        setShowNewConversationModal(false);
                        onConversationUpdate();
                    }}
                />
            )}
        </div>
    );
}
