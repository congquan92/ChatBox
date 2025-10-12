export async function register(username: string, password: string, email: string, displayName: string, msg: React.Dispatch<React.SetStateAction<string>>, loading: React.Dispatch<React.SetStateAction<boolean>>) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, email, displayName }),
        });
        const data = await response.json();
        if (!response.ok) {
            msg(data.message || data.error);
            console.error("Đăng ký không thành công:", data.message || data.error);
            return { ok: false };
        }
        msg("Đăng ký thành công! Vui lòng đăng nhập.");
        return { ok: true };
    } catch (error) {
        console.error("Lỗi server", error);
        msg("Lỗi server");
        return { ok: false };
    } finally {
        loading(false);
    }
}
