// Types for profile
export interface User {
    id: number;
    username: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileRequest {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
}

export interface SearchUsersParams {
    q: string;
    limit?: number;
}

export interface GetUsersParams {
    limit?: number;
}

const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export async function getCurrentUser(): Promise<{ ok: boolean; data?: User; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/me`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error fetching current user:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function updateProfile(profileData: UpdateProfileRequest): Promise<{ ok: boolean; data?: User; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/me`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(profileData),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function searchUsers(params: SearchUsersParams): Promise<{ ok: boolean; data?: User[]; error?: string }> {
    try {
        const queryParams = new URLSearchParams();
        queryParams.set("q", params.q);
        if (params.limit) queryParams.set("limit", params.limit.toString());

        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/search?${queryParams.toString()}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error searching users:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function getAllUsers(params: GetUsersParams = {}): Promise<{ ok: boolean; data?: User[]; error?: string }> {
    try {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.set("limit", params.limit.toString());

        const url = `${import.meta.env.VITE_API_URL}/profile/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

        const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { ok: false, error: "Network error" };
    }
}

export async function getUserById(userId: number): Promise<{ ok: boolean; data?: User; error?: string }> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/users/${userId}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, error: data.message || data.error };
        }
        return { ok: true, data: data.data || data };
    } catch (error) {
        console.error("Error fetching user:", error);
        return { ok: false, error: "Network error" };
    }
}
