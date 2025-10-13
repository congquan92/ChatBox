export interface RegisterData {
    username: string;
    password: string;
    email: string;
    displayName: string;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    token?: string;
}

// Đăng ký user mới
export async function registerUser(userData: RegisterData): Promise<AuthResponse | null> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
            return data as AuthResponse;
        } else {
            // Trả về error message từ server
            throw new Error(data.message || "Registration failed");
        }
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
}

// Đăng nhập user
export async function loginUser(credentials: LoginData): Promise<AuthResponse | null> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (response.ok) {
            return data as AuthResponse;
        } else {
            // Trả về error message từ server
            throw new Error(data.message || "Login failed");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
}
