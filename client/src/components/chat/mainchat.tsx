import { useEffect, useMemo, useState } from "react";
import { getUserConversations, type Conversation } from "@/api/conversations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, Send, Paperclip, Smile, Settings, LogOut, Users2, MessageSquareText } from "lucide-react";
import OnlineUser from "@/components/chat/OnlineUser";

// Helpers
function formatTimeISO(iso?: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString();
}

// Raw: "nameA|nameB" → display label for direct chat
function directTitleFromMemberUsers(raw?: string | null) {
    if (!raw) return "(Direct)";
    const parts = raw
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
    return parts.join(", ");
}

// Stub message type for demo
interface Message {
    id: string | number;
    conversationId: number;
    sender: string;
    content: string;
    createdAt: string; // ISO
}

export default function MainChat() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [text, setText] = useState("");
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUser] = useState({ id: 999, username: "you", displayName: "Bạn" });

    useEffect(() => {
        const fetchConversations = async () => {
            const data = await getUserConversations();
            setConversations(data);
            // auto-select first convo
            if (data?.length) setSelectedId(data[0].id as number);
        };
        fetchConversations();
    }, []);

    const selected = useMemo(() => conversations.find((c) => c.id === selectedId) || null, [conversations, selectedId]);

    // Fake load messages per selected conversation (replace with real API/socket later)
    useEffect(() => {
        if (!selected) return;
        // demo data
        const seed: Message[] = [
            {
                id: 1,
                conversationId: selected.id as number,
                sender: selected.lastMessageSender || "alex",
                content: selected.lastMessage || "Hello 👋",
                createdAt: selected.lastMessageTime || new Date().toISOString(),
            },
            {
                id: 2,
                conversationId: selected.id as number,
                sender: currentUser.username,
                content: "Đã nhận!",
                createdAt: new Date().toISOString(),
            },
        ];
        setMessages(seed);
    }, [selected?.id]);

    const filteredConversations = useMemo(() => {
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
            conversationId: selected.id as number,
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
            <OnlineUser
                sticky
                // onUserClick={(u) => {
                //     // mở/ tạo direct conversation với u
                //     // ví dụ: navigate(`/chat/${u.id}`) hoặc emit join/open room
                // }}
            />
            <div className="grid h-[calc(100vh-20rem)] w-full gap-4 p-2 md:p-4 lg:grid-cols-[360px_1fr]">
                {/* LEFT SIDEBAR: conversations list */}
                <Card className="flex min-h-0 flex-col rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <MessageSquareText className="h-5 w-5" /> Hộp thoại
                        </CardTitle>
                        <div className="relative mt-2">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm..." className="pl-8" />
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="min-h-0 flex-1 p-0">
                        <ScrollArea className="h-full">
                            <ul className="divide-y">
                                {filteredConversations.map((c) => {
                                    const isActive = c.id === selectedId;
                                    const title = c.type === "direct" ? directTitleFromMemberUsers(c.memberUsers) : c.title || "(Group)";
                                    return (
                                        <li key={c.id}>
                                            <button onClick={() => setSelectedId(c.id as number)} className={cn("flex w-full items-center gap-3 p-3 text-left transition", isActive ? "bg-accent/40" : "hover:bg-accent/20")}>
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={c.avatarUrl || undefined} />
                                                    <AvatarFallback>{(title?.[0] || "?").toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="truncate font-medium">{title}</p>
                                                        <span className="shrink-0 text-xs text-muted-foreground">{formatTimeISO(c.lastMessageTime as any)}</span>
                                                    </div>
                                                    <p className="truncate text-sm text-muted-foreground">{c.lastMessage || "(Chưa có tin nhắn)"}</p>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            {c.type}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {c.memberCount} thành viên
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                    <Separator />
                    {/* Profile & quick settings at the bottom */}
                    <CardFooter className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="https://i.pravatar.cc/100?img=13" />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{currentUser.displayName}</p>
                                <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost" title="Bạn bè">
                                <Users2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" title="Cài đặt">
                                <Settings className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" title="Đăng xuất">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                {/* RIGHT: chat window */}
                <Card className="flex min-h-0 flex-col rounded-2xl">
                    {/* Header */}
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={selected?.avatarUrl || undefined} />
                                <AvatarFallback>{(selected ? selected.title || directTitleFromMemberUsers(selected.memberUsers) || "?" : "?").toString().slice(0, 1).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{selected ? (selected.type === "direct" ? directTitleFromMemberUsers(selected.memberUsers) : selected.title || "(Group)") : "Chọn một cuộc trò chuyện"}</CardTitle>
                                {selected && (
                                    <p className="text-xs text-muted-foreground">
                                        {selected.memberCount} thành viên • nhãn {selected.label}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <Separator />

                    {/* Messages */}
                    <CardContent className="min-h-0 flex-1 p-0">
                        <ScrollArea className="h-full p-4">
                            {!selected && <div className="flex h-full items-center justify-center text-muted-foreground">Hãy chọn một cuộc trò chuyện ở bên trái.</div>}

                            {selected && (
                                <div className="flex flex-col gap-3">
                                    {messages.map((m) => {
                                        const mine = m.sender === currentUser.username;
                                        return (
                                            <div key={m.id} className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
                                                {!mine && (
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src="https://i.pravatar.cc/100?img=5" />
                                                        <AvatarFallback>A</AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm", mine ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                                                    <div className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatTimeISO(m.createdAt)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>

                    {/* Composer */}
                    <Separator />
                    <CardFooter className="gap-2">
                        <Button variant="ghost" size="icon" title="Đính kèm">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Emoji">
                            <Smile className="h-5 w-5" />
                        </Button>
                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={selected ? "Nhập tin nhắn..." : "Chọn cuộc trò chuyện để bắt đầu"}
                            disabled={!selected}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Button onClick={handleSend} disabled={!selected || !text.trim()}>
                            <Send className="mr-1 h-4 w-4" /> Gửi
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
