import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { useSocket } from "@/hook/useSocket";

export default function OnlineUser() {
    const { onlineUsers } = useSocket();
    const listRef = useRef<HTMLDivElement>(null);

    const scrollBy = (dx: number) => {
        const el = listRef.current;
        if (!el) return;
        el.scrollBy({ left: dx, behavior: "smooth" });
    };

    if (!onlineUsers || onlineUsers.length === 0) {
        return (
            <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Không có người dùng trực tuyến
                </div>
            </div>
        );
    }

    return (
        <div className="relative border-b bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 pt-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Đang trực tuyến</h3>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {onlineUsers.length}
                    </Badge>
                </div>

                <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => scrollBy(-160)} className="h-7 w-7" title="Cuộn trái">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => scrollBy(160)} className="h-7 w-7" title="Cuộn phải">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <TooltipProvider delayDuration={150}>
                <ScrollArea className="w-full">
                    <div ref={listRef} className="flex items-center gap-3 px-4 pb-3 overflow-x-auto">
                        {onlineUsers.map((u) => {
                            const initials =
                                u.displayName
                                    ?.trim()
                                    ?.split(/\s+/)
                                    .map((p) => p[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase() || u.username?.slice(0, 2).toUpperCase();

                            return (
                                <Tooltip key={u.id}>
                                    <TooltipTrigger asChild>
                                        <button className="group relative flex w-16 flex-col items-center gap-1 rounded-xl p-2 transition hover:bg-muted/60 focus:outline-none focus-visible:ring-2" type="button">
                                            <div className="relative">
                                                {/* Viền online */}
                                                <span className="absolute -right-0.5 -bottom-0.5 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background z-10"></span>

                                                <Avatar className="h-10 w-10 ring-1 ring-border shadow-sm transition group-hover:scale-[1.03]">
                                                    <AvatarImage src={u.avatarUrl} alt={u.displayName} />
                                                    <AvatarFallback className="bg-black text-white text-xs font-bold">{initials}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <span className="max-w-[64px] truncate text-xs text-muted-foreground">{u.displayName}</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="px-2 py-1 text-xs">
                                        <div className="font-medium">{u.displayName}</div>
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
