import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatTimeISO, directTitleFromMemberUsers } from "./utils";
import type { Conversation } from "./types";

export default function ConversationItem({ c, active, onClick }: { c: Conversation; active: boolean; onClick: () => void }) {
    const title = c.type === "direct" ? directTitleFromMemberUsers(c.memberUsers) : c.title || "(Group)";

    return (
        <li>
            <button onClick={onClick} className={cn("flex w-full items-center gap-3 p-3 text-left transition", active ? "bg-accent/40" : "hover:bg-accent/20")}>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={c.avatarUrl || undefined} />
                    <AvatarFallback>{(title?.[0] || "?").toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{title}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatTimeISO(c.lastMessageTime)}</span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{c.lastMessage || "(Chưa có tin nhắn)"}</p>
                    <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                            {c.type}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                            {c.memberCount ?? 0} thành viên
                        </Badge>
                    </div>
                </div>
            </button>
        </li>
    );
}
