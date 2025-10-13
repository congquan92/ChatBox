import React from "react";
import { SunIcon } from "lucide-react";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hook/useAuth";

export default function Navbar() {
    const { user } = useAuth();

    // Helper lấy chữ cái avatar
    const initial = user?.displayName?.[0]?.toUpperCase?.();

    return (
        <div className="sticky top-0 z-50 w-full border-b border-b-accent/10 bg-accent-foreground/10 backdrop-blur-sm">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8 lg:px-16">
                {/* Logo tĩnh */}
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage className="size-10 rounded-2xl object-cover" src="https://www.creativefabrica.com/wp-content/uploads/2021/03/18/zeus-logo-design-template-premium-vector-Graphics-9731442-1-1-580x387.jpg" />
                        <AvatarFallback className="size-10 bg-black text-xs uppercase text-white font-bold">ZC</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-base font-semibold text-foreground sm:inline">ZuesChat</span>
                </div>

                {/* Tiêu đề tĩnh */}
                <div className="truncate text-sm font-medium text-blue-950 dark:text-blue-300">Chào mừng đến với ZuesChat</div>

                {/* Góc phải: icon tĩnh + username động */}
                <div className="flex items-center gap-3">
                    {/* Icon (tĩnh) */}
                    <div className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border/50">
                        <SunIcon className="h-4 w-4 opacity-80" />
                    </div>

                    {/* Avatar + username (username là động) */}
                    <Avatar className="flex items-center gap-2 ">
                        <AvatarImage className="size-10 rounded-2xl object-cover" src={user?.avatarUrl} />
                        {initial && <AvatarFallback className="size-10 bg-black text-xs uppercase text-white font-bold">{initial}</AvatarFallback>}
                        <div className="text-sm font-medium text-foreground">{user?.displayName}</div>
                    </Avatar>
                </div>
            </div>
        </div>
    );
}
