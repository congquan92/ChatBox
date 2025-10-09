const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface ApiResponse<T = unknown> {
    data?: T;
    message?: string;
    error?: string;
    status: number;
}

export async function apiRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem("token");

    const config: RequestInit = {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (response.ok) {
            // Nếu response có cấu trúc { data: ... }, trả về data
            // Ngược lại trả về toàn bộ response
            return {
                data: data.data !== undefined ? data.data : data,
                message: data.message,
                status: response.status,
            };
        } else {
            return {
                error: data.message || data.error || "Request failed",
                message: data.message,
                status: response.status,
            };
        }
    } catch (error) {
        console.error("API request error:", error);
        return {
            error: "Lỗi kết nối đến server",
            status: 0,
        };
    }
}
