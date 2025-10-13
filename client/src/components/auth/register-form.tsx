import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { registerUser } from "@/api/auth/auth.api";

export function RegisterForm() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
        displayName: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(""); // Clear error when user types
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (!formData.username || !formData.password || !formData.email || !formData.displayName) {
            setError("Vui lòng điền đầy đủ thông tin");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            setLoading(false);
            return;
        }

        try {
            const response = await registerUser({
                username: formData.username,
                password: formData.password,
                email: formData.email,
                displayName: formData.displayName,
            });

            if (response) {
                // Đăng ký thành công, chuyển đến trang login
                navigate("/login", {
                    state: {
                        message: "Đăng ký thành công! Vui lòng đăng nhập.",
                    },
                });
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md space-y-8 p-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Tạo tài khoản mới</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Hoặc{" "}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            đăng nhập với tài khoản hiện có
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="username">Tên đăng nhập</Label>
                            <Input id="username" name="username" type="text" required value={formData.username} onChange={handleChange} placeholder="Nhập tên đăng nhập" className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="displayName">Tên hiển thị</Label>
                            <Input id="displayName" name="displayName" type="text" required value={formData.displayName} onChange={handleChange} placeholder="Nhập tên hiển thị" className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="Nhập email" className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="Nhập mật khẩu (ít nhất 6 ký tự)" className="mt-1" />
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu" className="mt-1" />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-800">{error}</div>
                        </div>
                    )}

                    <div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Đang xử lý..." : "Đăng ký"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
