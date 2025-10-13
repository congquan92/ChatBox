import { getUserConversations, type Conversation } from "@/api/conversations";
import OnlineUser from "@/components/chat/OnlineUser";
import { useEffect, useState } from "react";

export default function MainChat() {
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        const fetchConversations = async () => {
            const data = await getUserConversations();
            setConversations(data);
        };
        fetchConversations();
    }, []);

    return (
        <div>
            <OnlineUser />
            <h1>Main Chat Component</h1>
            {conversations.map((c) => (
                <div key={c.id}>{c.type == "direct" ? <h2>{c.memberUsers}</h2> : <h2>{c.title}</h2>}</div>
            ))}
        </div>
    );
}
