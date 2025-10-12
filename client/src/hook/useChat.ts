import { useContext } from "react";
import { ChatContext } from "@/context/ChatContextSimple";

export function useChatContext() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChatContext phải được sử dụng trong ChatProvider");
    }
    return context;
}
