import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { searchUsers } from "@/api/profile";
import { createConversation } from "@/api/conversations";
import { useSocket } from "@/hook/useSocket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Users, MessageCircle } from "lucide-react";

interface User {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string;
}

interface CreateConversationDialogProps {
    trigger?: React.ReactNode;
    onConversationCreated?: (conversation: any) => void;
}

export default function CreateConversationDialog({ trigger, onConversationCreated }: CreateConversationDialogProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [conversationType, setConversationType] = useState<"direct" | "group">("direct");
    const [groupTitle, setGroupTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    const { createConversation: createConversationSocket } = useSocket();

    // Search users
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const users = await searchUsers(query);
            setSearchResults(users);
        } catch (error) {
            console.error("Error searching users:", error);
        } finally {
            setSearching(false);
        }
    };

    // Add user to selection
    const addUser = (user: User) => {
        if (!selectedUsers.find((u) => u.id === user.id)) {
            const newSelection = [...selectedUsers, user];
            setSelectedUsers(newSelection);

            // Auto switch to group if more than 1 user
            if (newSelection.length > 1) {
                setConversationType("group");
            }
        }
        setSearchQuery("");
        setSearchResults([]);
    };

    // Remove user from selection
    const removeUser = (userId: number) => {
        const newSelection = selectedUsers.filter((u) => u.id !== userId);
        setSelectedUsers(newSelection);

        // Auto switch to direct if only 1 user
        if (newSelection.length <= 1) {
            setConversationType("direct");
        }
    };

    // Create conversation
    const handleCreate = async () => {
        if (selectedUsers.length === 0) return;

        setLoading(true);
        try {
            const conversationData = {
                type: conversationType,
                memberIds: selectedUsers.map((u) => u.id),
                title: conversationType === "group" ? groupTitle : undefined,
            };

            // Try API first
            const result = await createConversation(conversationData);
            if (result) {
                onConversationCreated?.(result);
            }

            // Also emit via socket for real-time updates
            createConversationSocket(conversationData);

            // Reset form
            setSelectedUsers([]);
            setGroupTitle("");
            setSearchQuery("");
            setSearchResults([]);
            setConversationType("direct");
            setOpen(false);
        } catch (error) {
            console.error("Error creating conversation:", error);
        } finally {
            setLoading(false);
        }
    };

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Conversation</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Type Selection */}
                    <div className="flex gap-2">
                        <Button variant={conversationType === "direct" ? "default" : "outline"} size="sm" onClick={() => setConversationType("direct")} disabled={selectedUsers.length > 1}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Direct
                        </Button>
                        <Button variant={conversationType === "group" ? "default" : "outline"} size="sm" onClick={() => setConversationType("group")}>
                            <Users className="mr-2 h-4 w-4" />
                            Group
                        </Button>
                    </div>

                    {/* Group Title (if group) */}
                    {conversationType === "group" && (
                        <div>
                            <Label htmlFor="groupTitle">Group Name</Label>
                            <Input id="groupTitle" value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} placeholder="Enter group name" className="mt-1" />
                        </div>
                    )}

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div>
                            <Label>Selected Users ({selectedUsers.length})</Label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {selectedUsers.map((user) => (
                                    <Badge key={user.id} variant="secondary" className="pr-1">
                                        <Avatar className="mr-2 h-4 w-4">
                                            <AvatarImage src={user.avatarUrl || ""} />
                                            <AvatarFallback className="text-xs">{user.displayName[0]?.toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        {user.displayName}
                                        <Button variant="ghost" size="sm" className="ml-1 h-auto p-0" onClick={() => removeUser(user.id)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* User Search */}
                    <div>
                        <Label htmlFor="userSearch">Add Users</Label>
                        <Input id="userSearch" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Search users by name or username..." className="mt-1" />

                        {/* Search Results */}
                        {(searching || searchResults.length > 0) && (
                            <div className="mt-2 max-h-40 overflow-y-auto rounded border">
                                {searching ? (
                                    <div className="p-3 text-center text-sm text-muted-foreground">Searching...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-3 text-center text-sm text-muted-foreground">No users found</div>
                                ) : (
                                    searchResults.map((user) => (
                                        <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-muted cursor-pointer" onClick={() => addUser(user)}>
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.avatarUrl || ""} />
                                                <AvatarFallback>{user.displayName[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{user.displayName}</p>
                                                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                            </div>
                                            {selectedUsers.find((u) => u.id === user.id) && (
                                                <Badge variant="secondary" size="sm">
                                                    Selected
                                                </Badge>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Create Button */}
                    <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={selectedUsers.length === 0 || loading || (conversationType === "group" && !groupTitle.trim())} className="flex-1">
                            {loading ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
