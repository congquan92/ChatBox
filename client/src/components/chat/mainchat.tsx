import { useCallback, useEffect, useMemo, useState } from "react";
import { getUserConversations, type Conversation } from "@/api/conversations.api";
import { getConversationMessages, type APIMessage, normalizeMessage, type Message } from "@/api/messages.api";
import ChatHeader from "@/components/chat/chat-header";
import ConversationList from "@/components/chat/conversation-list";
import MessageList from "@/components/chat/message-list";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hook/useAuth";
import { Loader2 } from "lucide-react";

export default function MainChat() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    const loadConversations = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getUserConversations();
            const list = response || [];
            setConversations(response);

            // Auto-select lần đầu
            if (list.length > 0 && selectedId == null) {
                setSelectedId(list[0].id);
            }
        } catch (error) {
            console.error("Error loading conversations:", error);
            setConversations([]);
        } finally {
            setLoading(false);
        }
        // Không phụ thuộc selectedId để tránh re-create vô ích
    }, [selectedId == null]);

    // Load list conversations
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const selected = useMemo(() => conversations.find((c) => c.id === selectedId) || null, [conversations, selectedId]);

    // Load messages khi đổi selected
    useEffect(() => {
        if (!selected || !user?.userName) {
            setMessages([]);
            return;
        }

        const abort = new AbortController();
        (async () => {
            try {
                setLoading(true);
                const apiItems: APIMessage[] = await getConversationMessages(selected.id, 1, 50);
                if (abort.signal.aborted) return;

                const normalized = apiItems.map((m) => normalizeMessage(m, user.userName));

                // sort tăng dần theo thời gian
                normalized.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

                setMessages(normalized);
            } catch (e) {
                if (!abort.signal.aborted) {
                    console.error("load messages error:", e);
                    setMessages([]);
                }
            } finally {
                if (!abort.signal.aborted) setLoading(false);
            }
        })();

        return () => abort.abort();
    }, [selected, user]);

    if (loading && conversations.length === 0) {
        return (
            <div>
                <Loader2 className="mx-auto my-20 animate-spin" />
            </div>
        );
    }

    return (
        <div className="grid h-[calc(100vh-10rem)] w-full gap-4 p-2 md:p-4 lg:grid-cols-[360px_1fr]">
            {/* LEFT */}
            <ConversationList conversations={conversations} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} />

            {/* RIGHT */}
            <Card className="flex min-h-0 flex-col rounded-2xl">
                <ChatHeader selected={selected} />
                <Separator />
                <MessageList messages={messages} selected={selected} />
            </Card>
        </div>
    );
}
