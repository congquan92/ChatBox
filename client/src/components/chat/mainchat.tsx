import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hook/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Send, MoreVertical } from "lucide-react";

type Chat = {
    id: number;
    name: string;
    lastMessage: string;
    avatar?: string;
    unread: number;
    participants?: string[];
    messages: { id: string; from: "me" | "them"; text: string; time: string }[];
};

export default function Mainchat() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [chats, setChats] = useState<Chat[]>([
        {
            id: 1,
            name: "Nguyễn Quân",
            lastMessage: "Ê mai đi học không?",
            avatar: "",
            unread: 2,
            participants: ["you", "Nguyễn Quân"],
            messages: [
                { id: "m1", from: "them", text: "Hello bro 👋", time: "09:01" },
                { id: "m2", from: "me", text: "Ờ chào, test chat nè 💬", time: "09:02" },
                { id: "m3", from: "them", text: "Ê mai đi học không?", time: "09:05" },
            ],
        },
        {
            id: 2,
            name: "ShopZues Team",
            lastMessage: "Cập nhật tính năng mới rồi nha!",
            avatar: "",
            unread: 0,
            participants: ["you", "Dev1", "Dev2"],
            messages: [{ id: "m4", from: "them", text: "Cập nhật tính năng mới rồi nha!", time: "08:10" }],
        },
        {
            id: 3,
            name: "Hacker Nặc Danh",
            lastMessage: "Gửi public key đi bro...",
            avatar: "",
            unread: 5,
            participants: ["you", "???"],
            messages: [{ id: "m5", from: "them", text: "Gửi public key đi bro...", time: "00:00" }],
        },
    ]);

    const [selectedChatId, setSelectedChatId] = useState<number | null>(1);
    const [search, setSearch] = useState("");
    const [newChatOpen, setNewChatOpen] = useState(false);
    const [newChatName, setNewChatName] = useState("");
    const [newChatMembers, setNewChatMembers] = useState("");

    const [draft, setDraft] = useState<string>(""); // ô nhập tin nhắn
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return chats;
        return chats.filter((c) => c.name.toLowerCase().includes(q));
    }, [search, chats]);

    const selected = useMemo(() => chats.find((c) => c.id === selectedChatId) || null, [chats, selectedChatId]);

    function handleSelectChat(id: number) {
        setSelectedChatId(id);
        // reset unread
        setChats((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    }

    function handleSend() {
        if (!selected || !draft.trim()) return;
        const text = draft.trim();
        const time = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        setChats((prev) =>
            prev.map((c) =>
                c.id === selected.id
                    ? {
                          ...c,
                          messages: [...c.messages, { id: crypto.randomUUID(), from: "me", text, time }],
                          lastMessage: text,
                      }
                    : c
            )
        );
        setDraft("");
        // giả lập bên kia trả lời + tăng unread (nếu chat khác)
        setTimeout(() => {
            setChats((prev) =>
                prev.map((c) =>
                    c.id === selected.id
                        ? {
                              ...c,
                              messages: [...c.messages, { id: crypto.randomUUID(), from: "them", text: "Đã nhận ✅", time: time }],
                              lastMessage: "Đã nhận ✅",
                          }
                        : c
                )
            );
        }, 500);
    }

    function onDraftKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    }

    function handleCreateChat() {
        const name = newChatName.trim();
        if (!name) return;
        const members = newChatMembers
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const id = Math.max(0, ...chats.map((c) => c.id)) + 1;
        const newChat: Chat = {
            id,
            name,
            lastMessage: "Hãy gửi lời chào 👋",
            avatar: "",
            unread: 0,
            participants: ["you", ...members],
            messages: [],
        };
        setChats((prev) => [newChat, ...prev]);
        setSelectedChatId(id);
        setNewChatOpen(false);
        setNewChatName("");
        setNewChatMembers("");
        // focus vào input nhắn
        setTimeout(() => inputRef.current?.focus(), 0);
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
                                <DialogDescription>Nhập tên cuộc trò chuyện và (tuỳ chọn) danh sách thành viên.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tên cuộc trò chuyện</label>
                                    <Input value={newChatName} onChange={(e) => setNewChatName(e.target.value)} placeholder="VD: Nhóm học ATTT" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Thành viên (phân cách dấu phẩy)</label>
                                    <Input value={newChatMembers} onChange={(e) => setNewChatMembers(e.target.value)} placeholder="VD: Quân, Minh, Thảo" />
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
                    {filtered.length === 0 && <div className="text-sm text-muted-foreground p-4">Không tìm thấy cuộc trò chuyện.</div>}
                    {filtered.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => handleSelectChat(chat.id)}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition border-b border-border/50 ${selectedChatId === chat.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"}`}
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={chat.avatar || ""} alt={chat.name} />
                                <AvatarFallback>
                                    {chat.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .slice(0, 2)
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium truncate">{chat.name}</div>
                                    {chat.unread > 0 && (
                                        <Badge variant="destructive" className="px-1 min-w-[20px] justify-center">
                                            {chat.unread}
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">{chat.lastMessage}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Chat panel */}
            <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        {selected && (
                            <>
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={selected.avatar || ""} alt={selected.name} />
                                    <AvatarFallback>
                                        {selected.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold">{selected.name}</div>
                                    <div className="text-xs text-muted-foreground">{selected.participants?.join(", ")}</div>
                                </div>
                            </>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" title="Tùy chọn">
                        <MoreVertical className="size-5" />
                    </Button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    {selected ? (
                        <div className="space-y-2">
                            {selected.messages.map((m) => (
                                <div key={m.id} className={`max-w-[75%] rounded-2xl px-3 py-2 leading-relaxed ${m.from === "me" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    <div>{m.text}</div>
                                    <div className={`mt-1 text-[10px] ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</div>
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
