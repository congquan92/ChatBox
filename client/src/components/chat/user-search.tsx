import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, UserPlus, Check, X } from "lucide-react";
import { searchUsers, type User } from "@/api/profile.api";

interface UserSearchProps {
    onUserSelect?: (user: User) => void;
    selectedUsers?: User[];
    placeholder?: string;
    title?: string;
    triggerIcon?: React.ReactNode;
    triggerText?: string;
    multiSelect?: boolean;
    excludeUserIds?: number[];
}

export function UserSearch({
    onUserSelect,
    selectedUsers = [],
    placeholder = "Tìm kiếm người dùng...",
    title = "Tìm kiếm người dùng",
    triggerIcon = <UserPlus className="size-4" />,
    triggerText = "Thêm người dùng",
    multiSelect = false,
    excludeUserIds = [],
}: UserSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [localSelectedUsers, setLocalSelectedUsers] = useState<User[]>(selectedUsers);

    // Reset local state when dialog opens/closes
    useEffect(() => {
        if (isOpen) {
            setLocalSelectedUsers(selectedUsers);
            setSearchQuery("");
            setSearchResults([]);
        }
    }, [isOpen, selectedUsers]);

    // Search users when query changes
    useEffect(() => {
        const handleSearch = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setLoading(true);
            const result = await searchUsers({ q: searchQuery, limit: 20 });
            if (result.ok && result.data) {
                // Filter out excluded users and already selected users
                const filteredResults = result.data.filter((user) => !excludeUserIds.includes(user.id) && !localSelectedUsers.some((selected) => selected.id === user.id));
                setSearchResults(filteredResults);
            }
            setLoading(false);
        };

        const debounceTimeout = setTimeout(handleSearch, 300);
        return () => clearTimeout(debounceTimeout);
    }, [searchQuery, excludeUserIds, localSelectedUsers]);

    const handleUserClick = (user: User) => {
        if (multiSelect) {
            if (localSelectedUsers.some((u) => u.id === user.id)) {
                // Remove user
                setLocalSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
            } else {
                // Add user
                setLocalSelectedUsers((prev) => [...prev, user]);
            }
        } else {
            onUserSelect?.(user);
            setIsOpen(false);
        }
    };

    const handleConfirm = () => {
        if (multiSelect) {
            localSelectedUsers.forEach((user) => onUserSelect?.(user));
        }
        setIsOpen(false);
    };

    const isUserSelected = (user: User) => {
        return localSelectedUsers.some((u) => u.id === user.id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    {triggerIcon}
                    {triggerText}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={placeholder} className="pl-8" />
                    </div>

                    {/* Selected Users (for multi-select) */}
                    {multiSelect && localSelectedUsers.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Đã chọn ({localSelectedUsers.length})</div>
                            <div className="flex flex-wrap gap-1">
                                {localSelectedUsers.map((user) => (
                                    <Badge key={user.id} variant="secondary" className="gap-1">
                                        {user.displayName}
                                        <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent" onClick={() => handleUserClick(user)}>
                                            <X className="size-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    <div className="space-y-2">
                        {loading && <div className="text-center text-sm text-muted-foreground py-4">Đang tìm kiếm...</div>}

                        {!loading && searchQuery && searchResults.length === 0 && <div className="text-center text-sm text-muted-foreground py-4">Không tìm thấy người dùng nào</div>}

                        {!loading && !searchQuery && <div className="text-center text-sm text-muted-foreground py-4">Nhập tên để tìm kiếm người dùng</div>}

                        <div className="max-h-64 overflow-y-auto space-y-1">
                            {searchResults.map((user) => (
                                <div
                                    key={user.id}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isUserSelected(user) ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"}`}
                                    onClick={() => handleUserClick(user)}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatarUrl} />
                                        <AvatarFallback className="text-xs">
                                            {user.displayName
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{user.displayName}</div>
                                        <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                    </div>

                                    {isUserSelected(user) && <Check className="size-4 text-primary flex-shrink-0" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Confirm Button (for multi-select) */}
                    {multiSelect && (
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                                Hủy
                            </Button>
                            <Button onClick={handleConfirm} className="flex-1" disabled={localSelectedUsers.length === 0}>
                                Xác nhận ({localSelectedUsers.length})
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
