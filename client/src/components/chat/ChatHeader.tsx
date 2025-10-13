import { CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Conversation } from "./types";
import { directTitleFromMemberUsers } from "./utils";

export default function ChatHeader({ selected }: { selected: Conversation | null }) {
    const title = selected ? (selected.type === "direct" ? directTitleFromMemberUsers(selected.memberUsers) : selected.title || "(Group)") : "Chọn một cuộc trò chuyện";

    const initial = (selected ? title || "?" : "?").toString().slice(0, 1).toUpperCase();

    return (
        <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={selected?.avatarUrl || undefined} />
                    <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-lg">{title}</CardTitle>
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
