import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatTimeISO } from "./utils";

export default function MessageItem({ content, createdAt, mine, displayName, avatarUrl }: { content: string; createdAt: string; mine: boolean; displayName: string; avatarUrl?: string }) {
    return (
        <div className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
            {!mine && (
                <Avatar className="size-10">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm", mine ? "bg-primary text-primary-foreground" : "bg-muted")}>
                <div className="whitespace-pre-wrap break-words">{content}</div>
                <div className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatTimeISO(createdAt)}</div>
            </div>
        </div>
    );
}
