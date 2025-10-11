import Mainchat from "@/components/chat/mainchat";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hook/useAuth";
import { useNavigate } from "react-router-dom";

export default function Home() {
    return (
        <div>
            <Mainchat />
        </div>
    );
}
