import { useEffect, useMemo, useState, useCallback } from "react";
import { getUserConversations } from "@/api/conversations";
import { getConversationMessages } from "@/api/messages";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import OnlineUser from "@/components/chat/OnlineUser";
import ConversationList from "./ConversationList";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import Composer from "./Composer";
import { useSocket } from "@/hook/useSocket";
import { useAuth } from "@/hook/useAuth";
import type { Conversation, Message } from "./types";
import { directTitleFromMemberUsers } from "./utils";

// Convert API message to component message format
function convertApiMessage(apiMessage: any): Message {
    return {
        id: apiMessage.id,
        conversationId: apiMessage.conversationId,
        sender: apiMessage.sender.username,
        content: apiMessage.content,
        createdAt: apiMessage.createdAt,
    };
}

export default function MainChat() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [text, setText] = useState("");
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);

    const { user } = useAuth();
    const { sendMessage, onNewMessage, onMessageEdited, onMessageDeleted, onConversationCreated, joinConversation, startTyping, stopTyping, typingUsers } = useSocket();

    // Load conversations
    useEffect(() => {
        const loadConversations = async () => {
            const data = await getUserConversations();
            setConversations(data || []);
            if (data?.length && !selectedId) {
                setSelectedId(Number(data[0].id));
            }
        };
        loadConversations();
    }, [selectedId]);

    // Load messages for selected conversation
    useEffect(() => {
        if (!selectedId) return;

        const loadMessages = async () => {
            setLoading(true);
            try {
                const data = await getConversationMessages(selectedId);
                if (data?.messages) {
                    const convertedMessages = data.messages.map(convertApiMessage);
                    setMessages(convertedMessages);
                }

                // Join conversation room for real-time updates
                joinConversation(selectedId);
            } catch (error) {
                console.error("Error loading messages:", error);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [selectedId, joinConversation]);

    // Socket event listeners
    useEffect(() => {
        // Listen for new messages
        onNewMessage((message: any) => {
            const convertedMessage = convertApiMessage(message);
            setMessages((prev) => [...prev, convertedMessage]);
        });

        // Listen for message edits
        onMessageEdited((data: any) => {
            setMessages((prev) => prev.map((msg) => (msg.id === data.messageId ? { ...msg, content: data.content, editedAt: data.editedAt } : msg)));
        });

        // Listen for message deletions
        onMessageDeleted((data: any) => {
            setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
        });

        // Listen for new conversations
        onConversationCreated((conversation: any) => {
            // Reload conversations list
            getUserConversations().then((data) => {
                setConversations(data || []);
            });
        });
    }, [onNewMessage, onMessageEdited, onMessageDeleted, onConversationCreated]);

    // Typing indicator
    const conversationTypingUsers = useMemo(() => {
        return typingUsers.filter((tu) => tu.conversationId === selectedId);
    }, [typingUsers, selectedId]);

    // Handle typing
    const handleTypingStart = useCallback(() => {
        if (!typing && selectedId) {
            setTyping(true);
            startTyping(selectedId);
        }
    }, [typing, selectedId, startTyping]);

    const handleTypingStop = useCallback(() => {
        if (typing && selectedId) {
            setTyping(false);
            stopTyping(selectedId);
        }
    }, [typing, selectedId, stopTyping]);

    // Auto stop typing after delay
    useEffect(() => {
        if (!typing) return;

        const timer = setTimeout(() => {
            handleTypingStop();
        }, 3000);

        return () => clearTimeout(timer);
    }, [typing, handleTypingStop]);

    const selected = useMemo(() => conversations.find((c) => Number(c.id) === selectedId) || null, [conversations, selectedId]);

    const filtered = useMemo(() => {
        if (!query.trim()) return conversations;
        const q = query.toLowerCase();
        return conversations.filter((c) => {
            const title = c.type === "direct" ? directTitleFromMemberUsers(c.memberUsers) : c.title || "";
            return title.toLowerCase().includes(q) || (c.lastMessage || "").toLowerCase().includes(q) || (c.label || "").toLowerCase().includes(q);
        });
    }, [conversations, query]);

    function handleSend() {
        if (!text.trim() || !selected || !user) return;

        // Send via socket
        sendMessage(Number(selected.id), text);

        // Clear input and stop typing
        setText("");
        handleTypingStop();
    }

    function handleTextChange(newText: string) {
        setText(newText);

        // Trigger typing indicator
        if (newText.trim() && !typing) {
            handleTypingStart();
        } else if (!newText.trim() && typing) {
            handleTypingStop();
        }
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

                    <MessageList messages={messages} currentUsername={user?.userName || ""} loading={loading} typingUsers={conversationTypingUsers} />

                    <Separator />

                    <Composer text={text} setText={handleTextChange} canSend={!!selected} onSend={handleSend} />
                </Card>
            </div>
        </>
    );
}
