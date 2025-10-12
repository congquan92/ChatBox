import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hook/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Send, MoreVertical, Loader2 } from "lucide-react";

// API imports
import { type Conversation, getConversations, createConversation } from "@/api/conversation.api";
import { type Message, getMessages, sendMessage as apiSendMessage } from "@/api/message.api";
import { searchUsers, type User } from "@/api/profile.api";

export default function Mainchat() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [search, setSearch] = useState("");
    const [newChatOpen, setNewChatOpen] = useState(false);
    const [newChatName, setNewChatName] = useState("");
    const [newChatMembers, setNewChatMembers] = useState("");
    const [newChatType, setNewChatType] = useState<"direct" | "group">("group");
    const [draft, setDraft] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [userSearchQuery, setUserSearchQuery] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);

    // Load conversations on mount
    useEffect(() => {
        const loadConversations = async () => {
            setLoading(true);
            const result = await getConversations();
            console.log("API Response:", result); // Debug log
            if (result.ok && result.data) {
                console.log("Conversations data:", result.data); // Debug log
                setConversations(result.data);
                // Auto-select first conversation if none selected
                if (!selectedConversationId && result.data.length > 0) {
                    setSelectedConversationId(result.data[0].id);
                }
            } else {
                console.error("Failed to load conversations:", result.error);
            }
            setLoading(false);
        };
        loadConversations();
    }, [selectedConversationId]);

    // Load messages when conversation changes
    useEffect(() => {
        const loadMessages = async (conversationId: number) => {
            setMessagesLoading(true);
            const result = await getMessages(conversationId, { limit: 50 });
            if (result.ok && result.data) {
                setMessages(result.data);
            }
            setMessagesLoading(false);
        };

        if (selectedConversationId) {
            loadMessages(selectedConversationId);
        }
    }, [selectedConversationId]);

    // Search users for creating conversations
    useEffect(() => {
        if (userSearchQuery.trim()) {
            handleUserSearch(userSearchQuery);
        } else {
            setSearchResults([]);
        }
    }, [userSearchQuery]);

    const handleUserSearch = async (query: string) => {
        const result = await searchUsers({ q: query, limit: 10 });
        if (result.ok && result.data) {
            setSearchResults(result.data);
        }
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q || !Array.isArray(conversations)) return conversations;
        return conversations.filter((c) => c.title?.toLowerCase().includes(q) || c.lastMessageSender?.toLowerCase().includes(q));
    }, [search, conversations]);

    const selected = useMemo(() => {
        if (!Array.isArray(conversations)) return null;
        return conversations.find((c) => c.id === selectedConversationId) || null;
    }, [conversations, selectedConversationId]);

    function handleSelectChat(id: number) {
        setSelectedConversationId(id);
    }

    const handleSend = async () => {
        if (!selected || !draft.trim()) return;

        const content = draft.trim();
        setDraft("");

        // Optimistically add message to UI
        const tempMessage: Message = {
            id: Date.now(), // Temporary ID
            conversationId: selected.id,
            senderId: 0, // Will be set by server
            content,
            contentType: "text",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sender: {
                id: 0,
                username: "you",
                displayName: "You",
                avatarUrl: "",
            },
        };

        setMessages((prev) => [...prev, tempMessage]);

        // Send to server
        const result = await apiSendMessage({
            conversationId: selected.id,
            content,
            contentType: "text",
        });

        if (result.ok && result.data) {
            // Replace temp message with real one
            setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? result.data! : m)));
        } else {
            // Remove temp message on error
            setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
        }
    };

    function onDraftKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    }

    const handleCreateChat = async () => {
        const title = newChatName.trim();
        if (!title && newChatType === "group") return;

        // Parse member usernames/IDs
        const memberUsernames = newChatMembers
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        // For now, we'll need to search for users by username to get their IDs
        // This is a simplified implementation
        const memberIds: number[] = [];
        for (const username of memberUsernames) {
            const result = await searchUsers({ q: username, limit: 1 });
            if (result.ok && result.data && result.data.length > 0) {
                memberIds.push(result.data[0].id);
            }
        }

        const conversationData = {
            type: newChatType,
            title: newChatType === "group" ? title : undefined,
            memberIds,
        };

        const result = await createConversation(conversationData);
        if (result.ok && result.data) {
            setConversations((prev) => [result.data!, ...prev]);
            setSelectedConversationId(result.data.id);
            setNewChatOpen(false);
            setNewChatName("");
            setNewChatMembers("");
            // Focus input
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                <Loader2 className="size-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-200px)] bg-background text-foreground">
            {/* LEFT: Sidebar */}
            <div className="w-[350px] max-w-[400px] border-r border-border bg-muted/30 flex flex-col">
                <div className="flex items-center gap-2 p-3 border-b border-border">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm cuộc trò chuyện..." className="pl-8" />
                    </div>

                    <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="default" className="shrink-0" title="Tạo cuộc trò chuyện mới">
                                <Plus className="size-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tạo cuộc trò chuyện mới</DialogTitle>
                                <DialogDescription>Chọn loại cuộc trò chuyện và thêm thành viên.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Loại cuộc trò chuyện</label>
                                    <div className="flex gap-2">
                                        <Button variant={newChatType === "direct" ? "default" : "outline"} onClick={() => setNewChatType("direct")} size="sm">
                                            Trực tiếp
                                        </Button>
                                        <Button variant={newChatType === "group" ? "default" : "outline"} onClick={() => setNewChatType("group")} size="sm">
                                            Nhóm
                                        </Button>
                                    </div>
                                </div>

                                {newChatType === "group" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Tên nhóm</label>
                                        <Input value={newChatName} onChange={(e) => setNewChatName(e.target.value)} placeholder="VD: Nhóm học ATTT" />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tìm kiếm thành viên</label>
                                    <Input value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} placeholder="Nhập tên người dùng..." />
                                    {searchResults.length > 0 && (
                                        <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                                            {searchResults.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center gap-2 p-1 hover:bg-muted rounded cursor-pointer"
                                                    onClick={() => {
                                                        const currentMembers = newChatMembers ? newChatMembers.split(",") : [];
                                                        if (!currentMembers.includes(user.username)) {
                                                            setNewChatMembers((prev) => (prev ? `${prev}, ${user.username}` : user.username));
                                                        }
                                                        setUserSearchQuery("");
                                                        setSearchResults([]);
                                                    }}
                                                >
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={user.avatarUrl} />
                                                        <AvatarFallback className="text-xs">
                                                            {user.displayName
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")
                                                                .slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="text-sm">
                                                        <div className="font-medium">{user.displayName}</div>
                                                        <div className="text-muted-foreground">@{user.username}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Thành viên đã chọn</label>
                                    <Input value={newChatMembers} onChange={(e) => setNewChatMembers(e.target.value)} placeholder="VD: quannguyen, minhtran" readOnly />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setNewChatOpen(false)}>
                                    Hủy
                                </Button>
                                <Button onClick={handleCreateChat}>Tạo</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button
                        size="sm"
                        variant="outline"
                        className="ml-1"
                        onClick={() => {
                            logout();
                            navigate("/", { replace: true });
                        }}
                    >
                        Đăng xuất
                    </Button>
                </div>

                <div className="overflow-y-auto flex-1">
                    {!Array.isArray(filtered) || filtered.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-4">Không tìm thấy cuộc trò chuyện.</div>
                    ) : (
                        filtered.map((conversation) => {
                            // Get conversation display info
                            const displayTitle = conversation.title || (conversation.type === "direct" ? `${conversation.lastMessageSender || "User"}` : "Conversation");
                            const lastMessage = conversation.lastMessage || "Nhấp để xem tin nhắn...";

                            return (
                                <div
                                    key={conversation.id}
                                    onClick={() => handleSelectChat(conversation.id)}
                                    className={`flex items-center gap-3 p-3 cursor-pointer transition border-b border-border/50 ${selectedConversationId === conversation.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={conversation.avatarUrl || ""} alt={displayTitle} />
                                        <AvatarFallback>
                                            {displayTitle
                                                .split(" ")
                                                .map((n) => n[0])
                                                .slice(0, 2)
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium truncate">{displayTitle}</div>
                                            <Badge variant="secondary" className="px-1 min-w-[20px] justify-center">
                                                {conversation.memberCount}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground truncate">{lastMessage}</div>
                                        {conversation.lastMessageTime && (
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(conversation.lastMessageTime).toLocaleTimeString("vi-VN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* RIGHT: Chat panel */}
            <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        {selected && (
                            <>
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={selected.avatarUrl || ""} alt={selected.title || "Chat"} />
                                    <AvatarFallback>
                                        {(selected.title || "Chat")
                                            .split(" ")
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold">{selected.title || "Conversation"}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {selected.memberCount} thành viên
                                        {selected.lastMessageSender && ` • Tin nhắn cuối: ${selected.lastMessageSender}`}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" title="Tùy chọn">
                        <MoreVertical className="size-5" />
                    </Button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    {messagesLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="size-6 animate-spin" />
                        </div>
                    ) : selected ? (
                        <div className="space-y-2">
                            {messages.map((message) => (
                                <div key={message.id} className={`max-w-[75%] rounded-2xl px-3 py-2 leading-relaxed ${message.sender.username === "you" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    <div className="text-xs font-medium mb-1">{message.sender.displayName}</div>
                                    <div>{message.content}</div>
                                    <div className={`mt-1 text-[10px] ${message.sender.username === "you" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                        {new Date(message.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-muted-foreground flex h-full items-center justify-center">Hãy chọn 1 đoạn chat bên trái để bắt đầu.</div>
                    )}
                </div>

                {/* composer */}
                {selected && (
                    <>
                        <Separator />
                        <div className="p-3 flex items-center gap-2">
                            <Input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onDraftKey} placeholder="Nhập tin nhắn..." className="flex-1" />
                            <Button onClick={handleSend} disabled={!draft.trim()}>
                                <Send className="size-4 mr-1" />
                                Gửi
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
