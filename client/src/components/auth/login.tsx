import { useState } from "react";
import { login } from "@/api/auth/login";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { decodeJWTToken } from "@/lib/helpers";

export default function Login() {
    const [username, setUsername] = useState("alex1");
    const [password, setPassword] = useState("123");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await login(username, password);

            if (response.status === 200 && response.data) {
                // Decode JWT token để lấy user info
                const payload = decodeJWTToken(response.data.token);

                if (payload) {
                    const userData = {
                        id: payload.id,
                        username: payload.username,
                        displayName: payload.displayName,
                    };

                    authLogin(response.data.token, userData);
                    navigate("/chat");
                } else {
                    setError("Token không hợp lệ");
                }
            } else {
                setError(response.error || "Lỗi đăng nhập");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh flex items-center justify-center p-6">
            <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-xl p-6">
                <h1 className="text-xl font-semibold">Đăng nhập</h1>
                {error && <div className="text-red-600 text-sm">{error}</div>}

                <div className="space-y-2">
                    <label className="text-sm">Tài khoản</label>
                    <input className="w-full border rounded-md p-2" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập" required />
                </div>

                <div className="space-y-2">
                    <label className="text-sm">Mật khẩu</label>
                    <input className="w-full border rounded-md p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Đang đăng nhập…" : "Đăng nhập"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Chưa có tài khoản?
                    <button type="button" className="text-primary hover:underline ml-1" onClick={() => navigate("/register")}>
                        Đăng ký
                    </button>
                </div>
            </form>
        </div>
    );
}
