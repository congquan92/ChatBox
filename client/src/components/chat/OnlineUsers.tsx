import { useSocket } from "@/hooks/useSocket";

export default function OnlineUsers() {
    const { onlineUsers } = useSocket();

    if (onlineUsers.length === 0) return null;

    return (
        <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Đang trực tuyến ({onlineUsers.length})</h3>
            <div className="flex space-x-2 overflow-x-auto">
                {onlineUsers.map((user) => (
                    <div key={user.id} className="flex flex-col items-center space-y-1 flex-shrink-0">
                        <div className="relative">
                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">{user.displayName.charAt(0).toUpperCase()}</div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <span className="text-xs text-center max-w-16 truncate">{user.displayName}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
