export async function login(username: string, password: string, msg: React.Dispatch<React.SetStateAction<string>>, loading: React.Dispatch<React.SetStateAction<boolean>>) {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            msg(data.message);
            console.error("Yeu cầu không thành công:", data.message);
            return { ok: false };
        }
        msg(data.message);
        localStorage.setItem("token", data.token);
        return { ok: true };
    } catch (error) {
        console.error("Lỗi server", error);
        msg("Lỗi server");
    } finally {
        loading(false);
    }
}
