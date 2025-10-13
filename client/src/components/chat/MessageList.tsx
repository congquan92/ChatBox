import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageItem from "./MessageItem";
import type { Message } from "./types";

export default function MessageList({ messages, currentUsername, emptyText = "Hãy chọn một cuộc trò chuyện ở bên trái." }: { messages: Message[]; currentUsername: string; emptyText?: string }) {
    const hasMessages = messages.length > 0;

    return (
        <CardContent className="min-h-0 flex-1 p-0">
            <ScrollArea className="h-full p-4">
                {!hasMessages && <div className="flex h-full items-center justify-center text-muted-foreground">{emptyText}</div>}

                {hasMessages && (
                    <div className="flex flex-col gap-3">
                        {messages.map((m) => (
                            <MessageItem key={m.id} content={m.content} createdAt={m.createdAt} mine={m.sender === currentUsername} />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </CardContent>
    );
}
