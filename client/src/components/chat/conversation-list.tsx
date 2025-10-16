import type { Conversation } from "@/api/conversations.api";
import ConversationItem from "@/components/chat/conversation-item";
import NewConversationModal from "@/components/chat/NewConversationModal";
import SidebarFooter from "@/components/chat/sider-footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { MessageSquareText } from "lucide-react";
import { useState } from "react";

export default function ConversationList({ conversations, selectedId, onSelect }: { conversations: Conversation[]; selectedId: number | null; onSelect: (id: number) => void }) {
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);
    return (
        <Card className="flex min-h-0 flex-col rounded-2xl">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageSquareText className="h-5 w-5" /> Hộp thoại
                    {showNewConversationModal && (
                        <NewConversationModal
                            onClose={() => setShowNewConversationModal(false)}
                            onSuccess={() => {
                                setShowNewConversationModal(false);
                                onConversationUpdate();
                            }}
                        />
                    )}
                </CardTitle>
                <div className="mt-2">{/* <SearchBox value={query} onChange={onQueryChange} /> */}</div>
            </CardHeader>
            <Separator />
            <CardContent className="min-h-0 flex-1 p-0">
                <ScrollArea className="h-full">
                    <ul className="divide-y">
                        {conversations.map((c) => (
                            <ConversationItem key={c.id} c={c} active={c.id === selectedId} onClick={() => onSelect(c.id as number)} />
                        ))}
                    </ul>
                </ScrollArea>
            </CardContent>
            <Separator />
            <CardFooter className="flex items-center justify-between gap-2">
                <SidebarFooter />
            </CardFooter>
        </Card>
    );
}
