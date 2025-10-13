export function formatTimeISO(iso?: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString();
}

// Raw: "nameA|nameB" → display label cho direct chat
export function directTitleFromMemberUsers(raw?: string | null) {
    if (!raw) return "(Direct)";
    const parts = raw
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
    return parts.join(", ");
}
