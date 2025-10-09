import { useState, useEffect, useRef, useCallback } from "react";
import { type Conversation } from "@/api/conversations";
import { type Message, getMessages } from "@/api/messages";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
    conversation: Conversation;
    onConversationUpdate: () => void;
}

export default function ChatWindow({ conversation, onConversationUpdate }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { socket } = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        loadMessages();

        // Join conversation room
        if (socket) {
            socket.emit("join_conversation", { conversationId: conversation.id });
        }

        return () => {
            // Leave conversation room khi unmount
            if (socket) {
                socket.emit("leave_conversation", { conversationId: conversation.id });
            }
        };
    }, [conversation.id, socket]);

    useEffect(() => {
        // Listen for real-time messages
        if (socket) {
            socket.on("new_message", handleNewMessage);
            socket.on("user_typing", handleUserTyping);
            socket.on("user_stop_typing", handleUserStopTyping);

            return () => {
                socket.off("new_message", handleNewMessage);
                socket.off("user_typing", handleUserTyping);
                socket.off("user_stop_typing", handleUserStopTyping);
            };
        }
    }, [socket, conversation.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getMessages(conversation.id);
            if (response.status === 200 && response.data) {
                setMessages(response.data.messages || []);
            }
        } catch (error) {
            console.error("Error loading messages:", error);
        } finally {
            setLoading(false);
        }
    }, [conversation.id]);

    const handleNewMessage = useCallback(
        (message: Message) => {
            if (message.conversationId === conversation.id) {
                setMessages((prev) => [...prev, message]);
            }
        },
        [conversation.id]
    );

    const handleUserTyping = useCallback(
        (data: { conversationId: number; user: { displayName: string } }) => {
            if (data.conversationId === conversation.id) {
                setIsTyping((prev) => [...prev.filter((u) => u !== data.user.displayName), data.user.displayName]);
            }
        },
        [conversation.id]
    );

    const handleUserStopTyping = useCallback(
        (data: { conversationId: number; userId: number }) => {
            if (data.conversationId === conversation.id) {
                setIsTyping((prev) => prev.filter((u) => u !== user?.displayName));
            }
        },
        [conversation.id, user?.displayName]
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const messageContent = newMessage.trim();
        setNewMessage("");

        try {
            // Gửi qua socket cho real-time
            if (socket) {
                socket.emit("send_message", {
                    conversationId: conversation.id,
                    content: messageContent,
                    contentType: "text",
                });
            }

            onConversationUpdate();
        } catch (error) {
            console.error("Error sending message:", error);
            setNewMessage(messageContent); // Restore message if failed
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        // Typing indicator
        if (socket && e.target.value) {
            socket.emit("typing_start", { conversationId: conversation.id });
        } else if (socket) {
            socket.emit("typing_stop", { conversationId: conversation.id });
        }
    };

    const getConversationName = () => {
        if (conversation.title) return conversation.title;
        if (conversation.type === "direct" && conversation.members.length === 2) {
            const otherMember = conversation.members.find((m) => m.username !== user?.username);
            return otherMember?.displayName || otherMember?.username || "Unknown";
        }
        return `Nhóm ${conversation.members.length} người`;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b bg-card">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                            {conversation.type === "group" ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                            ) : (
                                getConversationName().charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold">{getConversationName()}</h2>
                            <p className="text-sm text-muted-foreground">{conversation.members.length} thành viên</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-muted-foreground">Đang tải tin nhắn...</div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-muted-foreground">
                            <div className="text-4xl mb-2">💬</div>
                            <div>Chưa có tin nhắn nào</div>
                            <div className="text-sm">Hãy gửi tin nhắn đầu tiên!</div>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => <MessageBubble key={message.id} message={message} isOwnMessage={message.senderId === user?.id} />)
                )}

                {/* Typing indicator */}
                {isTyping.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                        <span>{isTyping.join(", ")} đang nhập...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input type="text" value={newMessage} onChange={handleInputChange} placeholder="Nhập tin nhắn..." className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" disabled={sending} />
                    <Button type="submit" disabled={!newMessage.trim() || sending}>
                        {sending ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
