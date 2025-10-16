// MessageList.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation, Message, newMessage } from "./types";
import MessageItem from "@/components/chat/message-item";
import Composer from "@/components/chat/Composer";
import { Separator } from "@/components/ui/separator";
import { socket } from "@/lib/socket";
import { useAuth } from "@/hook/useAuth";
import type { TypingUser } from "@/components/chat/typingIndicator";
import TypingIndicator from "@/components/chat/typingIndicator";
import { dayLabel, isSameDay } from "@/components/chat/utils";

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
    const [typingUsers, setTypingUsers] = useState<Record<number, TypingUser>>({});
    const endRef = useRef<HTMLDivElement | null>(null);

    // Khi đổi cuộc trò chuyện, sync props -> state
    useEffect(() => {
        setList(messages ?? []);
    }, [selected?.id, messages]);

    // Lắng nghe tin nhắn realtime và append nếu đúng room
    useEffect(() => {
        if (!selected) return;

        const handleNewMessage = (msg: newMessage) => {
            // Bảo vệ nhầm room
            if (msg.conversationId !== selected.id) return;

            // Map server  -> UI
            const mapped: Message = {
                id: msg.id,
                content: msg.content,
                createdAt: msg.createdAt ?? new Date().toISOString(),
                mine: user ? msg.sender.username === user.userName : false,
                avatarUrl: msg.sender?.avatarUrl ?? undefined,
                displayName: msg.sender?.displayName,
                username: msg.sender?.username,
            };

            setList((prev) => [...prev, mapped]);

            // người gửi gửi xong -> xoá khỏi typing (nếu có)
            setTypingUsers((prev) => {
                const copy = { ...prev };
                delete copy[msg.senderId];
                return copy;
            });
        };

        socket.on("new_message", handleNewMessage);
        return () => {
            socket.off("new_message", handleNewMessage);
        };
    }, [selected, user]);

    // Realtime: typing start/stop
    useEffect(() => {
        if (!selected) return;

        const onTyping = (p: TypingUser) => {
            if (p.conversationId !== selected.id) return;
            if (p.username === user?.userName) return; // không show chính mình
            setTypingUsers((prev) => ({ ...prev, [p.userId]: p }));
        };

        const onStop = (p: Pick<TypingUser, "userId" | "conversationId">) => {
            if (p.conversationId !== selected.id) return;
            setTypingUsers((prev) => {
                const copy = { ...prev };
                delete copy[p.userId];
                return copy;
            });
        };

        socket.on("user_typing", onTyping);
        socket.on("user_stop_typing", onStop);
        return () => {
            socket.off("user_typing", onTyping);
            socket.off("user_stop_typing", onStop);
        };
    }, [selected, user]);

    // Auto scroll khi có msg mới hoặc typing thay đổi
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [list, typingUsers]);

    const hasMessages = list.length > 0;

    // Chuẩn bị mảng users để render TypingIndicator
    const typingList = useMemo(() => Object.values(typingUsers), [typingUsers]);

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
                            {/* Hiển thị "đang gõ…" ngay trên Composer */}
                            <TypingIndicator typingUsers={typingList} />
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
