import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { getUserConversations, type Conversation } from "@/api/conversations.api";
import { getConversationMessages } from "@/api/messages.api";
import { normalizeMessage, type Message, type APIMessage } from "@/api/messages.api";
import ChatHeader from "@/components/chat/chat-header";
import ConversationList from "@/components/chat/conversation-list";
import MessageList from "@/components/chat/message-list";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hook/useAuth";
import { Loader2 } from "lucide-react";
import Composer from "@/components/chat/Composer";
import { useSocket } from "@/hook/useSocket";

export default function MainChat() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const { sendMessage, joinConversation, startTyping, stopTyping } = useSocket();

    // Load conversations
    useEffect(() => {
        (async () => {
            try {
                const data = await getUserConversations();
                setConversations(data || []);
                if (!selectedId && data?.length) setSelectedId(data[0].id);
            } catch (e) {
                console.error(e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selected = useMemo(() => conversations.find((c) => c.id === selectedId) || null, [conversations, selectedId]);

    // Load messages khi đổi conversation
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
                normalized.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                setMessages(normalized);

                // Join conversation room qua socket
                if (selected.id) {
                    joinConversation(selected.id);
                }
            } catch (e) {
                console.error("load messages error:", e);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [selected, user?.userName, joinConversation]);

    // Socket: Lắng nghe new_message
    useEffect(() => {
        const handleNewMessage = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (!user?.userName) return;

            // Chỉ thêm message nếu thuộc conversation đang chọn
            if (detail.conversationId === selectedId) {
                const newMsg: Message = {
                    id: detail.id,
                    content: detail.content,
                    createdAt: detail.createdAt,
                    mine: detail.sender.username === user.userName,
                    username: detail.sender.username,
                    displayName: detail.sender.displayName,
                    avatarUrl: detail.sender.avatarUrl,
                };
                setMessages((prev) => [...prev, newMsg]);
            }

            // Update last message trong conversation list
            setConversations((prev) =>
                prev.map((conv) =>
                    conv.id === detail.conversationId
                        ? {
                              ...conv,
                              lastMessage: detail.content,
                              lastMessageTime: detail.createdAt,
                              lastMessageSender: detail.sender.username,
                          }
                        : conv
                )
            );
        };

        const handleMessageEdited = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            setMessages((prev) => prev.map((msg) => (msg.id === detail.messageId ? { ...msg, content: detail.content } : msg)));
        };

        const handleMessageDeleted = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            setMessages((prev) => prev.filter((msg) => msg.id !== detail.messageId));
        };

        window.addEventListener("socket:new_message", handleNewMessage);
        window.addEventListener("socket:message_edited", handleMessageEdited);
        window.addEventListener("socket:message_deleted", handleMessageDeleted);

        return () => {
            window.removeEventListener("socket:new_message", handleNewMessage);
            window.removeEventListener("socket:message_edited", handleMessageEdited);
            window.removeEventListener("socket:message_deleted", handleMessageDeleted);
        };
    }, [selectedId, user?.userName]);

    // Typing indicators
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleTextChange = useCallback(
        (value: string) => {
            setText(value);

            if (!selected) return;

            if (value.trim() && !isTyping) {
                setIsTyping(true);
                startTyping(selected.id);
            }

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                if (isTyping) {
                    setIsTyping(false);
                    stopTyping(selected.id);
                }
            }, 1000);
        },
        [selected, isTyping, startTyping, stopTyping]
    );

    const handleSend = async () => {
        if (!text.trim() || !selected || !user?.userName) return;

        sendMessage({ conversationId: selected.id, content: text.trim() });
        setText("");

        if (isTyping) {
            setIsTyping(false);
            stopTyping(selected.id);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    if (loading) {
        return (
            <div>
                <Loader2 className="mx-auto my-20 animate-spin" />
            </div>
        );
    }

    return (
        <div className="grid h-[calc(100vh-10rem)] w-full gap-4 p-2 md:p-4 lg:grid-cols-[360px_1fr]">
            <ConversationList conversations={conversations} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} />

            <Card className="flex min-h-0 flex-col rounded-2xl">
                <ChatHeader selected={selected} />
                <Separator />
                <MessageList messages={messages} />
                <Separator />
                <Composer text={text} setText={handleTextChange} canSend={!!selected} onSend={handleSend} />
            </Card>
        </div>
    );
}
