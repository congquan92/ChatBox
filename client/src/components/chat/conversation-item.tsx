import type { Conversation } from "@/api/conversations.api";
import { formatTimeISO } from "@/components/chat/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hook/useAuth";
import { cn } from "@/lib/utils";

export default function ConversationItem({ c, active, onClick }: { c: Conversation; active: boolean; onClick: () => void }) {
    const { user } = useAuth();

    return (
        <li>
            <button onClick={onClick} className={cn("flex w-full items-center gap-3 p-3 text-left transition", active ? "bg-accent/40" : "hover:bg-accent/20")}>
                <Avatar className="size-15">
                    {/* lấy c.avartar nếu có , còn không lấy c.members[1]?.avatarUrl nếu cả 2 đều không có thì lấy undefined */}
                    <AvatarImage src={c.avatarUrl ?? c.members[1]?.avatarUrl ?? undefined} className="object-cover border-2 border-black rounded-full" />
                    <AvatarFallback>{(c.title?.[0] ?? c.members[1].displayName).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">{c.title ?? c.members[1]?.displayName}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatTimeISO(c.lastMessageTime)}</span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                        {c.lastMessageSender === user?.userName ? "Me :" : c.lastMessageSender + " :"} {c.lastMessage || "(Chưa có tin nhắn)"}
                    </p>
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
