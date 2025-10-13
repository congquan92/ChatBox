export interface User {
    id: number;
    username: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
    createdAt: string;
}

export interface ProfileUpdateData {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
}

// Lấy profile của user hiện tại
export async function getMyProfile(): Promise<User | null> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.data as User;
        }
        return null;
    } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
}

// Cập nhật profile
export async function updateProfile(updateData: ProfileUpdateData): Promise<boolean> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify(updateData),
        });

        return response.ok;
    } catch (error) {
        console.error("Error updating profile:", error);
        return false;
    }
}

// Tìm kiếm user
export async function searchUsers(query: string, limit: number = 20): Promise<User[]> {
    try {
        const params = new URLSearchParams({
            q: query,
            limit: limit.toString(),
        });

        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/search?${params}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.users as User[];
        }
        return [];
    } catch (error) {
        console.error("Error searching users:", error);
        return [];
    }
}

// Lấy danh sách tất cả user
export async function getAllUsers(limit: number = 50): Promise<User[]> {
    try {
        const params = new URLSearchParams({
            limit: limit.toString(),
        });

        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/users?${params}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.users as User[];
        }
        return [];
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

// Lấy thông tin user theo ID
export async function getUserById(userId: number): Promise<User | null> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/profile/users/${userId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.user as User;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return null;
    }
}
