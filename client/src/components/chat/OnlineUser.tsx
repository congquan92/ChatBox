import React, { useMemo, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { useSocket } from "@/hook/useSocket";

type OnlineUserItem = {
    id: number | string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
};

export default function OnlineUser({ sticky = false, onUserClick, title = "Đang trực tuyến" }: { sticky?: boolean; onUserClick?: (user: OnlineUserItem) => void; title?: string }) {
    const { onlineUsers } = useSocket() as { onlineUsers: OnlineUserItem[] | undefined };
    const listRef = useRef<HTMLDivElement>(null);

    const count = onlineUsers?.length ?? 0;
    const containerCls = useMemo(
        () =>
            [
                "relative border-b bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                sticky ? "sticky top-16 z-40" : "", // nếu Navbar cao 64px
            ]
                .filter(Boolean)
                .join(" "),
        [sticky]
    );

    const scrollBy = (dx: number) => {
        const el = listRef.current;
        if (!el) return;
        el.scrollBy({ left: dx, behavior: "smooth" });
    };

    const renderEmpty = () => (
        <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Không có người dùng trực tuyến
            </div>
        </div>
    );

    if (!onlineUsers || onlineUsers.length === 0) return renderEmpty();

    return (
        <div className={containerCls}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {count}
                    </Badge>
                </div>

                <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Cuộn trái" aria-label="Cuộn trái" onClick={() => scrollBy(-180)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Cuộn phải" aria-label="Cuộn phải" onClick={() => scrollBy(180)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* List */}
            <TooltipProvider delayDuration={120}>
                <ScrollArea className="w-full">
                    <div
                        ref={listRef}
                        className="flex items-center gap-3 overflow-x-auto px-4 pb-3"
                        // đảm bảo con không wrap để scroll ngang mượt
                    >
                        {onlineUsers.map((u) => {
                            const name = u.displayName?.trim() || u.username;
                            const initials =
                                u.displayName
                                    ?.trim()
                                    ?.split(/\s+/)
                                    .map((p) => p[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase() || u.username.slice(0, 2).toUpperCase();

                            return (
                                <Tooltip key={u.id}>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => onUserClick?.(u)}
                                            className="group relative flex w-16 flex-col items-center gap-1 rounded-xl p-2 outline-none transition hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <div className="relative">
                                                {/* dot online */}
                                                <span className="absolute -right-0.5 -bottom-0.5 z-10 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                                                <Avatar className="h-16 w-16 border ring-1 ring-border shadow-sm transition group-hover:scale-[1.03]">
                                                    <AvatarImage className="object-cover" src={u.avatarUrl ?? undefined} alt={name} />
                                                    <AvatarFallback className="bg-foreground text-background text-xs font-bold">{initials}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <span className="max-w-[64px] truncate text-xs text-muted-foreground">{name}</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="px-2 py-1 text-xs">
                                        <div className="font-medium">{name}</div>
                                        <div className="text-muted-foreground">@{u.username}</div>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </TooltipProvider>
        </div>
    );
}
