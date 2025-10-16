import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Smile } from "lucide-react";
import type { Conversation, newMessage } from "@/components/chat/types";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import type { TypingUser } from "@/components/chat/typingIndicator";

export default function Composer({ selected }: { selected: Conversation | null }) {
    const [text, setText] = useState("");
    const prevRoomRef = useRef<string | null>(null);
    const typingTimerRef = useRef<number | null>(null);
    const isTypingRef = useRef(false);

    // --- JOIN/LEAVE ROOM khi đổi cuộc trò chuyện
    useEffect(() => {
        const newRoom = selected ? `conversation_${selected.id}` : null;

        // rời room cũ
        if (prevRoomRef.current && prevRoomRef.current !== newRoom) {
            socket.emit("leave_conversation", { conversationId: prevRoomRef.current.split("_")[1] });
        }

        // join room mới
        if (newRoom) {
            socket.emit("join_conversation", { conversationId: selected!.id });
            prevRoomRef.current = newRoom;
        }

        // cleanup khi unmount
        return () => {
            if (prevRoomRef.current) {
                socket.emit("leave_conversation", { conversationId: prevRoomRef.current.split("_")[1] });
                prevRoomRef.current = null;
            }
        };
        // KHÔNG đưa `socket` vào deps (singleton). Dùng optional chaining cho selected.
    }, [selected]);

    // --- HANDLERS
    const handleNewMessage = (msg: newMessage) => {
        // Bạn có thể nâng cấp: push vào state messages ở component cha thông qua prop/callback
        // Tạm thời log để xác nhận luồng
        console.log("new_message:", msg);
    };

    const handleUserTyping = (payload: TypingUser) => {
        console.log("user_typing:", payload);
    };

    const handleUserStopTyping = (payload: TypingUser) => {
        console.log("user_stop_typing:", payload);
    };

    // --- Đăng ký listener 1 lần + dọn dẹp đúng handler
    useEffect(() => {
        socket.on("new_message", handleNewMessage);
        socket.on("user_typing", handleUserTyping);
        socket.on("user_stop_typing", handleUserStopTyping);

        return () => {
            socket.off("new_message", handleNewMessage);
            socket.off("user_typing", handleUserTyping);
            socket.off("user_stop_typing", handleUserStopTyping);
        };
    }, []); // chỉ chạy 1 lần

    // --- Gửi tin nhắn
    const handleSend = () => {
        const content = text.trim();
        if (!content || !selected) {
            // nếu đang gõ thì báo stop
            if (isTypingRef.current && selected) {
                socket.emit("typing_stop", { conversationId: selected.id });
                isTypingRef.current = false;
            }
            return;
        }

        socket.emit("send_message", { conversationId: selected.id, content });
        setText("");

        // sau khi gửi thì stop typing
        socket.emit("typing_stop", { conversationId: selected.id });
        isTypingRef.current = false;
    };

    // --- Typing indicator (debounce)
    const onChangeText = (v: string) => {
        setText(v);

        if (!selected) return;

        if (!isTypingRef.current) {
            socket.emit("typing_start", { conversationId: selected.id });
            isTypingRef.current = true;
        }

        if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = window.setTimeout(() => {
            if (isTypingRef.current) {
                socket.emit("typing_stop", { conversationId: selected.id });
                isTypingRef.current = false;
            }
        }, 2200); // hết gõ 2.2s thì báo stop
    };

    return (
        <CardFooter className="gap-2">
            <Button variant="ghost" size="icon" title="Đính kèm">
                <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="Emoji">
                <Smile className="h-5 w-5" />
            </Button>
            <Input
                value={text}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
            />
            <Button onClick={handleSend} disabled={!text.trim() || !selected}>
                <Send className="mr-1 h-4 w-4" /> Gửi
            </Button>
        </CardFooter>
    );
}
