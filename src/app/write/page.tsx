"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Feather } from "lucide-react";

export default function WritePoemPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function checkAuth() {
            const { data } = await supabase.auth.getUser();
            if (!data?.user) {
                alert("Please log in to write a poem.");
                router.push("/login");
            } else {
                setUserId(data.user.id);
            }
        }
        checkAuth();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setLoading(true);
        const { error } = await supabase.from("poems").insert({
            author_id: userId,
            title,
            content,
        });
        setLoading(false);

        if (error) {
            alert("Error publishing poem: " + error.message);
        } else {
            alert("Poem published successfully!");
            router.push("/");
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center p-6">
            <Navbar />

            <div className="w-full max-w-xl mt-24 mb-10">
                <div className="bg-[var(--card)] p-8 rounded-3xl shadow-lg border border-[var(--border)] relative overflow-hidden">
                    {/* Decorative subtle element */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex items-center gap-3 mb-8 border-b border-[var(--border)] pb-6">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <Feather size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-[var(--foreground)]">Pen a Poem</h1>
                            <p className="text-sm text-[var(--muted-foreground)]">Share your heart under the moonlight</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2 px-1">
                                Title
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={60}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-primary/50 text-[var(--foreground)] font-serif text-lg transition shadow-inner placeholder-[var(--muted-foreground)]/50"
                                placeholder="The Silent River"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2 px-1">
                                Poem Content
                            </label>
                            <textarea
                                required
                                rows={12}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-primary/50 text-[var(--foreground)] font-serif text-lg leading-relaxed transition shadow-inner custom-scrollbar resize-y placeholder-[var(--muted-foreground)]/50"
                                placeholder="Write your verses here..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !title.trim() || !content.trim()}
                            className="w-full bg-primary hover:bg-orange-600 text-white font-medium py-4 rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Feather size={18} />
                                    Publish to the World
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
