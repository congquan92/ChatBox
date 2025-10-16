// MessageList.tsx
import { useEffect, useRef, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation, Message } from "./types";
import MessageItem from "@/components/chat/message-item";
import Composer from "@/components/chat/Composer";
import { Separator } from "@/components/ui/separator";
import { socket } from "@/lib/socket";
import { useAuth } from "@/hook/useAuth";

function isSameDay(aISO: string, bISO: string) {
    const a = new Date(aISO),
        b = new Date(bISO);
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function dayLabel(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = new Date(iso);
    day.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - day.getTime()) / 86400000);
    if (diff === 0) return "Hôm nay";
    if (diff === 1) return "Hôm qua";
    return d.toLocaleDateString();
}
function DayDivider({ iso }: { iso: string }) {
    return (
        <div className="my-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{dayLabel(iso)}</span>
            <div className="h-px flex-1 bg-border" />
        </div>
    );
}

export default function MessageList({ messages, emptyText = "Hãy chọn một cuộc trò chuyện ở bên trái.", selected }: { messages: Message[]; emptyText?: string; selected: Conversation | null }) {
    const { user } = useAuth(); // { id, displayName, avatarUrl, ... }
    const [list, setList] = useState<Message[]>(messages ?? []);
    const endRef = useRef<HTMLDivElement | null>(null);

    // Khi đổi cuộc trò chuyện, sync props -> state
    useEffect(() => {
        setList(messages ?? []);
    }, [selected?.id, messages]);

    // Lắng nghe tin nhắn realtime và append nếu đúng room
    useEffect(() => {
        if (!selected) return;

        const handleNewMessage = (msg: any) => {
            // Bảo vệ nhầm room
            if (msg.conversationId !== selected.id) return;

            // Map server -> UI
            const mapped: Message = {
                id: msg.id,
                content: msg.content,
                createdAt: msg.createdAt ?? new Date().toISOString(),
                mine: user ? msg.sender.username === user.userName : false,
                avatarUrl: msg.sender?.avatarUrl ?? undefined,
                displayName: msg.sender?.displayName ?? msg.sender?.username ?? "Người dùng",
            };

            setList((prev) => [...prev, mapped]);
        };

        socket.on("new_message", handleNewMessage);
        return () => {
            socket.off("new_message", handleNewMessage);
        };
    }, [selected, user]);

    // Auto scroll cuối danh sách
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [list]);

    const hasMessages = list.length > 0;

    return (
        <>
            <CardContent className="min-h-0 flex-1 p-0">
                <ScrollArea className="h-full p-4">
                    {!hasMessages && <div className="flex h-full items-center justify-center text-muted-foreground">{emptyText}</div>}

                    {hasMessages && (
                        <div className="flex flex-col gap-3">
                            {list.map((m, i) => {
                                const prev = list[i - 1];
                                const needDivider = !prev || !isSameDay(prev.createdAt, m.createdAt);
                                return (
                                    <div key={m.id}>
                                        {needDivider && <DayDivider iso={m.createdAt} />}
                                        <MessageItem content={m.content} createdAt={m.createdAt} mine={m.mine} avatarUrl={m.avatarUrl} displayName={m.displayName} />
                                    </div>
                                );
                            })}
                            <div ref={endRef} />
                        </div>
                    )}
                </ScrollArea>
            </CardContent>

            <Separator />
            <Composer selected={selected} />
        </>
    );
}
