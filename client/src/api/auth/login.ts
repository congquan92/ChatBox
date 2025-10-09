import { apiRequest } from "@/lib/api";

interface LoginResponse {
    message: string;
    token: string;
}

interface LoginRequest {
    username: string;
    password: string;
}

export async function login(username: string, password: string) {
    const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password } as LoginRequest),
    });

    return response;
}
