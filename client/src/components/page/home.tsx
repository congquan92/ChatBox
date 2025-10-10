import { Button } from "@/components/ui/button";
import { useAuth } from "@/hook/useAuth";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    return (
        <div>
            <p>May da dang nhap</p>
            <Button
                onClick={() => {
                    logout();
                    navigate("/", { replace: true });
                }}
            >
                Dang Xuat
            </Button>
        </div>
    );
}
