import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatTimeChat } from "./utils";

export default function MessageItem({ content, createdAt, mine, displayName, avatarUrl }: { content: string; createdAt: string; mine: boolean; displayName: string; avatarUrl?: string }) {
    return (
        <div className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
            {!mine && (
                <Avatar className="size-10">
                    <AvatarImage src={avatarUrl} className="border-2 border-black object-full rounded-full" />
                    <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            )}

            <div className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm", mine ? "bg-primary text-primary-foreground" : "bg-muted")}>
                <div className="whitespace-pre-wrap break-words">{content}</div>
                <div className="flex gap-2 mt-2 justify-start ">
                    <div className={cn("text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{mine ? "you" : displayName}</div>
                    <div className={cn("text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatTimeChat(createdAt)}</div>
                </div>
            </div>
        </div>
    );
}
