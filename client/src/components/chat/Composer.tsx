import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Smile } from "lucide-react";

export default function Composer({ text, setText, canSend, onSend }: { text: string; setText: (v: string) => void; canSend: boolean; onSend: () => void }) {
    return (
        <CardFooter className="gap-2">
            <Button variant="ghost" size="icon" title="Đính kèm">
                <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="Emoji">
                <Smile className="h-5 w-5" />
            </Button>
            <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={canSend ? "Nhập tin nhắn..." : "Chọn cuộc trò chuyện để bắt đầu"}
                disabled={!canSend}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        onSend();
                    }
                }}
            />
            <Button onClick={onSend} disabled={!canSend || !text.trim()}>
                <Send className="mr-1 h-4 w-4" /> Gửi
            </Button>
        </CardFooter>
    );
}
