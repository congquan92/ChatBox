import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchBox({ value, onChange, placeholder = "Tìm kiếm..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
            <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-8" />
        </div>
    );
}
