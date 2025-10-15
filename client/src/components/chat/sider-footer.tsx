import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Users2 } from "lucide-react";
import { useAuth } from "@/hook/useAuth";

export default function SidebarFooter() {
    const { user, logout } = useAuth();

    return (
        <>
            <div className="flex items-center gap-3">
                <Avatar className="size-10">
                    <AvatarImage src={user?.avatarUrl} className="object-cover rounded-full border-2 border-black" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium">{user?.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{user?.userName}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" title="Bạn bè">
                    <Users2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" title="Cài đặt">
                    <Settings className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" title="Đăng xuất" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </>
    );
}
