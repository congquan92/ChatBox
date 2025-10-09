import { useState } from "react";
import { register } from "@/api/auth/register";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        displayName: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        if (formData.password.length < 3) {
            setError("Mật khẩu phải có ít nhất 3 ký tự");
            return;
        }

        setLoading(true);

        try {
            const response = await register({
                username: formData.username,
                password: formData.password,
                email: formData.email,
                displayName: formData.displayName,
            });

            if (response.status === 201) {
                setSuccess("Đăng ký thành công! Chuyển hướng đến trang đăng nhập...");
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                setError(response.error || "Lỗi đăng ký");
            }
        } catch (err) {
            console.error("Register error:", err);
            setError("Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh flex items-center justify-center p-6">
            <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 border rounded-xl p-6">
                <h1 className="text-xl font-semibold">Đăng ký tài khoản</h1>

                {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
                {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">{success}</div>}

                <div className="space-y-2">
                    <label className="text-sm">Tên đăng nhập</label>
                    <input className="w-full border rounded-md p-2" name="username" value={formData.username} onChange={handleChange} placeholder="username" required />
                </div>

                <div className="space-y-2">
                    <label className="text-sm">Email</label>
                    <input className="w-full border rounded-md p-2" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" required />
                </div>

                <div className="space-y-2">
                    <label className="text-sm">Tên hiển thị</label>
                    <input className="w-full border rounded-md p-2" name="displayName" value={formData.displayName} onChange={handleChange} placeholder="Tên của bạn" required />
                </div>

                <div className="space-y-2">
                    <label className="text-sm">Mật khẩu</label>
                    <input className="w-full border rounded-md p-2" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••" required />
                </div>

                <div className="space-y-2">
                    <label className="text-sm">Xác nhận mật khẩu</label>
                    <input className="w-full border rounded-md p-2" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••" required />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Đang đăng ký…" : "Đăng ký"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Đã có tài khoản?
                    <button type="button" className="text-primary hover:underline ml-1" onClick={() => navigate("/")}>
                        Đăng nhập
                    </button>
                </div>
            </form>
        </div>
    );
}
