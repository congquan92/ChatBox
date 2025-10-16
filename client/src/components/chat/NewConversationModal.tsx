import { useState } from "react";

import { Button } from "@/components/ui/button";
import { searchUsers } from "@/api/profile.api";
import { createConversation } from "@/api/conversations.api";

interface NewConversationModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewConversationModal({ onClose, onSuccess }: NewConversationModalProps) {
    const [type, setType] = useState<"direct" | "group">("direct");
    const [title, setTitle] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Array<{ id: number; username: string; displayName: string }>>([]);
    const [selectedUsers, setSelectedUsers] = useState<Array<{ id: number; username: string; displayName: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearchLoading(true);
        try {
            const response = await searchUsers(searchQuery);
            if (response.length > 0) {
                setSearchResults(response);
            }
        } catch (error) {
            console.error("Error searching users:", error);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleUserSelect = (user: { id: number; username: string; displayName: string }) => {
        if (!selectedUsers.find((u) => u.id === user.id)) {
            setSelectedUsers((prev) => [...prev, user]);
        }
    };

    const handleUserRemove = (userId: number) => {
        setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUsers.length === 0) return;

        setLoading(true);
        try {
            const response = await createConversation({
                type,
                title: type === "group" ? title : undefined,
                memberIds: selectedUsers.map((u) => u.id),
            });

            if (response !== null) {
                onSuccess();
            }
            //  else if (response.status === 409) {
            //     // Conversation đã tồn tại, vẫn coi là thành công
            //     console.log("Conversation already exists:", response.data);
            //     onSuccess();
            // }
        } catch (error: any) {
            console.error("Error creating conversation:", error);
            // Kiểm tra nếu lỗi là 409 từ response
            if (error.response?.status === 409) {
                console.log("Conversation already exists, redirecting...");
                onSuccess();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Tạo cuộc trò chuyện mới</h2>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                        {/* Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Loại cuộc trò chuyện</label>
                            <div className="flex space-x-2">
                                <button type="button" onClick={() => setType("direct")} className={`px-3 py-2 rounded-md text-sm ${type === "direct" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                    Riêng tư
                                </button>
                                <button type="button" onClick={() => setType("group")} className={`px-3 py-2 rounded-md text-sm ${type === "group" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                    Nhóm
                                </button>
                            </div>
                        </div>

                        {/* Group Title */}
                        {type === "group" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tên nhóm</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên nhóm" className="w-full border rounded-md p-2" required />
                            </div>
                        )}

                        {/* User Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tìm người dùng</label>
                            <div className="flex space-x-2">
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Nhập tên đăng nhập hoặc tên hiển thị" className="flex-1 border rounded-md p-2" />
                                <Button type="button" onClick={handleSearch} disabled={searchLoading || !searchQuery.trim()} size="sm">
                                    {searchLoading ? "..." : "Tìm"}
                                </Button>
                            </div>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kết quả tìm kiếm</label>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {searchResults.map((user) => (
                                        <div key={user.id} onClick={() => handleUserSelect(user)} className="p-2 border rounded-md cursor-pointer hover:bg-accent flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{user.displayName}</div>
                                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                                            </div>
                                            {selectedUsers.find((u) => u.id === user.id) && (
                                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selected Users */}
                        {selectedUsers.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Đã chọn ({selectedUsers.length} người)</label>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {selectedUsers.map((user) => (
                                        <div key={user.id} className="p-2 border rounded-md bg-accent flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{user.displayName}</div>
                                                <div className="text-sm text-muted-foreground">@{user.username}</div>
                                            </div>
                                            <button type="button" onClick={() => handleUserRemove(user.id)} className="text-red-500 hover:text-red-700">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t flex space-x-2">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading || selectedUsers.length === 0} className="flex-1">
                            {loading ? "Đang tạo..." : "Tạo"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
