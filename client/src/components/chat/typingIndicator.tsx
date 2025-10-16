export interface TypingUser {
    userId: number;
    username: string;
    displayName: string;
    conversationId: number;
}

interface TypingIndicatorProps {
    typingUsers: TypingUser[];
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    if (typingUsers.length === 0) return null;

    const getTypingText = () => {
        if (typingUsers.length === 1) {
            return `${typingUsers[0].displayName} is typing...`;
        } else if (typingUsers.length === 2) {
            return `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing...`;
        } else {
            return `${typingUsers[0].displayName} and ${typingUsers.length - 1} others are typing...`;
        }
    };

    return (
        <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span>{getTypingText()}</span>
        </div>
    );
}
