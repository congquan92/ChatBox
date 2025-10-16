import { useEffect, useMemo, useState } from "react";
import { getUserConversations, type Conversation } from "@/api/conversations.api";
import { getConversationMessages } from "@/api/messages.api";
import { normalizeMessage, type Message, type APIMessage } from "@/api/messages.api"; // nếu normalize ở file khác thì import đúng path
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

    // load list conversations
    useEffect(() => {
        (async () => {
            try {
                const data = await getUserConversations();
                setConversations(data || []);
                // chọn cuộc trò chuyện đầu tiên nếu chưa chọn
                if (!selectedId && data?.length) setSelectedId(data[0].id);
            } catch (e) {
                console.error(e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selected = useMemo(() => conversations.find((c) => c.id === selectedId) || null, [conversations, selectedId]);

    // load messages khi đổi selectedId
    useEffect(() => {
        (async () => {
            if (!selected || !user?.userName) {
                setMessages([]);
                return;
            }
            try {
                setLoading(true);
                const apiItems: APIMessage[] = await getConversationMessages(selected.id, 1, 50);
                const normalized = apiItems.map((m) => normalizeMessage(m, user.userName));
                // sort tăng dần theo thời gian (nếu backend trả ngược)
                normalized.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                setMessages(normalized);
            } catch (e) {
                console.error("load messages error:", e);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [selected, user]);

    if (loading) {
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
                {/* Có thể truyền loading để show skeleton */}
                <MessageList messages={messages} selected={selected} />
            </Card>
        </div>
    );
}
