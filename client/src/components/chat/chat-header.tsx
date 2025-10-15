import type { Conversation } from "@/api/conversations.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatHeader({ selected }: { selected: Conversation | null }) {
    const initial = "LOI";
    return (
        <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <Avatar className="size-10">
                    <AvatarImage src={selected?.avatarUrl || undefined} className="rounded-full object-cover border-1 border-black" />
                    <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-lg">{selected?.title}</CardTitle>
                    {selected && (
                        <p className="text-xs text-muted-foreground">
                            {selected.memberCount} thành viên • nhãn {selected.label}
                        </p>
                    )}
                </div>
            </div>
        </CardHeader>
    );
}
