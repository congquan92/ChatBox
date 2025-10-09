import { type Message } from "@/api/messages";

interface MessageBubbleProps {
    message: Message;
    isOwnMessage: boolean;
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            <div className="max-w-xs lg:max-w-md">
                {!isOwnMessage && <div className="text-xs text-muted-foreground mb-1 ml-1">{message.sender.displayName}</div>}
                <div className={`rounded-lg px-3 py-2 ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <div className="break-words">{message.content}</div>
                    <div className={`text-xs mt-1 ${isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                        {formatTime(message.createdAt)}
                        {message.isEdited && " (đã chỉnh sửa)"}
                    </div>
                </div>
            </div>
        </div>
    );
}
