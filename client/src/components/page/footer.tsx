import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export function Footer({ status = "Đang trực tuyến", version = "v1.0.0" }: { status?: string; version?: string }) {
    return (
        <footer className="mt-4 border-t bg-background/70">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 md:px-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                    <span className="hidden sm:inline">{status}</span>
                    <Separator orientation="vertical" className="mx-2 hidden h-4 sm:inline" />
                    <span className="text-xs">{version}</span>
                </div>
                <nav className="flex items-center gap-4 text-xs text-muted-foreground">
                    <Link to="/privacy" className="hover:underline">
                        Privacy
                    </Link>
                    <Link to="/terms" className="hover:underline">
                        Terms
                    </Link>
                    <Link to="/help" className="hover:underline">
                        Help
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
