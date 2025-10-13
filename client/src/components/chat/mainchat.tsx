import { useEffect, useMemo, useState } from "react";
import { getUserConversations } from "@/api/conversations.api";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import OnlineUser from "@/components/chat/OnlineUser";
import ConversationList from "./ConversationList";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import Composer from "./Composer";
import type { Conversation, Message } from "./types";
import { directTitleFromMemberUsers } from "./utils";

export default function MainChat() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [text, setText] = useState("");
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUser] = useState({ id: 999, username: "you", displayName: "Bạn" });

    // load list
    useEffect(() => {
        (async () => {
            const data = await getUserConversations();
            setConversations(data || []);
            if (data?.length) setSelectedId(Number(data[0].id));
        })();
    }, []);

    const selected = useMemo(() => conversations.find((c) => Number(c.id) === selectedId) || null, [conversations, selectedId]);

    // fake message seed theo selected (thay bằng socket hoặc API)
    useEffect(() => {
        if (!selected) return;
        const seed: Message[] = [
            {
                id: 1,
                conversationId: Number(selected.id),
                sender: selected.lastMessageSender || "alex",
                content: selected.lastMessage || "Hello 👋",
                createdAt: selected.lastMessageTime || new Date().toISOString(),
            },
            {
                id: 2,
                conversationId: Number(selected.id),
                sender: currentUser.username,
                content: "Đã nhận!",
                createdAt: new Date().toISOString(),
            },
        ];
        setMessages(seed);
    }, [selected, currentUser.username]);

    const filtered = useMemo(() => {
        if (!query.trim()) return conversations;
        const q = query.toLowerCase();
        return conversations.filter((c) => {
            const title = c.type === "direct" ? directTitleFromMemberUsers(c.memberUsers) : c.title || "";
            return title.toLowerCase().includes(q) || (c.lastMessage || "").toLowerCase().includes(q) || (c.label || "").toLowerCase().includes(q);
        });
    }, [conversations, query]);

    function handleSend() {
        if (!text.trim() || !selected) return;
        const msg: Message = {
            id: Date.now(),
            conversationId: Number(selected.id),
            sender: currentUser.username,
            content: text,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, msg]);
        setText("");
        // TODO: socket.emit("send_message", { conversationId: selected.id, content: text })
    }

    return (
        <>
            <OnlineUser sticky />
            <div className="grid h-[calc(100vh-20rem)] w-full gap-4 p-2 md:p-4 lg:grid-cols-[360px_1fr]">
                {/* LEFT */}
                <ConversationList conversations={filtered} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} query={query} onQueryChange={setQuery} />

                {/* RIGHT */}
                <Card className="flex min-h-0 flex-col rounded-2xl">
                    <ChatHeader selected={selected} />
                    <Separator />
                    <MessageList messages={messages} currentUsername={currentUser.username} />
                    <Separator />
                    <Composer text={text} setText={setText} canSend={!!selected} onSend={handleSend} />
                </Card>
            </div>
        </>
    );
}
