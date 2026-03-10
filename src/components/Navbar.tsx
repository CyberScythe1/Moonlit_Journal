import { Moon, AlertTriangle, PenTool, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface NavbarProps {
    onReport?: () => void;
    showReport?: boolean;
}

export default function Navbar({ onReport, showReport = false }: NavbarProps) {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user) setUserId(data.user.id);
        });
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-b from-[var(--background)] to-transparent z-50 flex items-center justify-between px-6 pointer-events-none">
            <Link href="/" className="flex items-center gap-2 pointer-events-auto group">
                <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Moon className="text-primary fill-primary/20" size={24} />
                </div>
                <span className="font-semibold text-lg text-[var(--foreground)] tracking-wide">Moonlit</span>
            </Link>

            <div className="flex items-center gap-4 pointer-events-auto">
                {showReport && (
                    <button
                        onClick={onReport}
                        className="p-2 rounded-full bg-[var(--card)]/80 backdrop-blur shadow-sm text-[var(--muted-foreground)] hover:text-red-500 transition-colors border border-[var(--border)]"
                        aria-label="Report"
                    >
                        <AlertTriangle size={18} />
                    </button>
                )}

                <Link href="/write" className="p-2 rounded-full bg-[var(--card)]/80 backdrop-blur shadow-sm text-primary hover:text-orange-600 transition-colors border border-[var(--border)]">
                    <PenTool size={18} />
                </Link>

                {userId ? (
                    <Link href={`/profile/${userId}`} className="p-2 rounded-full bg-[var(--card)]/80 backdrop-blur shadow-sm text-[var(--foreground)] hover:text-primary transition-colors border border-[var(--border)]">
                        <User size={18} />
                    </Link>
                ) : (
                    <Link href="/login" className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm">
                        Sign In
                    </Link>
                )}
            </div>
        </header>
    );
}
