import { apiRequest } from "@/lib/api";

interface RegisterResponse {
    message: string;
}

interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    displayName: string;
}

export async function register(userData: RegisterRequest) {
    const response = await apiRequest<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
    });

    return response;
}
