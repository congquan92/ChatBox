import { getUserConversations, type Conversation } from "@/api/conversations.api";
import ChatHeader from "@/components/chat/chat-header";
import Composer from "@/components/chat/composer";
import ConversationList from "@/components/chat/conversion/conversation-list";
import { Card } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";
import { useEffect, useMemo, useState } from "react";

export default function MainChat() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [text, setText] = useState("");

    // load list conversations
    useEffect(() => {
        (async () => {
            const data = await getUserConversations();
            setConversations(data);
        })();
    }, []);

    const selected = useMemo(() => conversations.find((c) => c.id === selectedId) || null, [conversations, selectedId]);
    const handleSend = () => {
        if (!text.trim() || !selected) return;
        console.log("send", text);
        setText("");
    };

    return (
        <>
            {/* <OnlineUser sticky /> */}
            <div className="grid h-[calc(100vh-10rem)] w-full gap-4 p-2 md:p-4 lg:grid-cols-[360px_1fr]">
                {/* LEFT */}
                <ConversationList conversations={conversations} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} />
                {/* <ConversationList conversations={filtered} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} query={query} onQueryChange={setQuery} /> */}
                {/* RIGHT */}
                <Card className="flex flex-col rounded-none">
                    <ChatHeader selected={selected} />
                    <Separator className="my-2" />
                    <div>ssdas</div>
                    {/* <ChatHeader selected={selected} />
                    <Separator />
                    <MessageList messages={messages} currentUsername={currentUser.username} />
                    <Separator />
                    <Composer text={text} setText={setText} canSend={!!selected} onSend={handleSend} /> */}
                    <Separator />
                    <Composer text={text} setText={setText} canSend={!!selected} onSend={handleSend} />
                </Card>
            </div>
        </>
    );
}
