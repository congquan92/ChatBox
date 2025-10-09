import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { getUserConversations, type Conversation } from "@/api/conversations";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import OnlineUsers from "./OnlineUsers";

export default function ChatInterface() {
    const { user, logout } = useAuth();
    const { connected } = useSocket();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const loadConversations = useCallback(async () => {
        try {
            const response = await getUserConversations();

            if (response.status === 200 && response.data) {
                // Đảm bảo response.data là một array
                const conversationsData = Array.isArray(response.data) ? response.data : [];
                setConversations(conversationsData);
                if (conversationsData.length > 0 && !activeConversationId) {
                    setActiveConversationId(conversationsData[0].id);
                }
            } else {
                setConversations([]);
            }
        } catch (error) {
            console.error("Error loading conversations:", error);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }, [activeConversationId]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const activeConversation = Array.isArray(conversations) ? conversations.find((c) => c.id === activeConversationId) : undefined;

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-lg">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="h-screen flex">
            {/* Left Sidebar */}
            <div className="w-80 border-r flex flex-col">
                {/* User Profile Header */}
                <div className="p-4 border-b bg-card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">{user?.displayName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}</div>
                            <div>
                                <div className="font-medium">{user?.displayName || user?.username}</div>
                                <div className="text-sm text-muted-foreground flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${connected ? "bg-green-500" : "bg-red-500"}`} />
                                    {connected ? "Đang kết nối" : "Mất kết nối"}
                                </div>
                            </div>
                        </div>
                        <button onClick={logout} className="text-muted-foreground hover:text-foreground" title="Đăng xuất">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Online Users */}
                <OnlineUsers />

                {/* Conversations List */}
                <div className="flex-1 overflow-hidden">
                    <ConversationList conversations={conversations} activeConversationId={activeConversationId} onSelectConversation={setActiveConversationId} onConversationUpdate={loadConversations} />
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {activeConversation ? (
                    <ChatWindow conversation={activeConversation} onConversationUpdate={loadConversations} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <div className="text-6xl mb-4">💬</div>
                            <div className="text-lg">Chọn một cuộc trò chuyện để bắt đầu</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
