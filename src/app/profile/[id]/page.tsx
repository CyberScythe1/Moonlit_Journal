"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { UserPlus, UserCheck, BookOpen, User } from "lucide-react";
import { Poem } from "@/components/SwipeCard";

interface Profile {
    id: string;
    username: string;
    bio: string | null;
    avatar_url: string | null;
}

export default function AuthorProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [poems, setPoems] = useState<Poem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [followerCount, setFollowerCount] = useState(0);

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            setLoading(true);

            const { data: authData } = await supabase.auth.getUser();
            const currentId = authData?.user?.id;
            setCurrentUserId(currentId || null);

            // Load Profile
            const { data: profileData } = await supabase
                .from("users")
                .select("*")
                .eq("id", id)
                .single();

            if (profileData) setProfile(profileData);

            // Load Poems
            const { data: poemsData } = await supabase
                .from("poems")
                .select("*, users(username)")
                .eq("author_id", id)
                .order("created_at", { ascending: false });

            if (poemsData) {
                setPoems(poemsData.map(p => ({
                    id: p.id,
                    title: p.title,
                    content: p.content,
                    author_id: p.author_id,
                    author_name: p.users?.username
                })));
            }

            // Check follow status & count
            const { count } = await supabase
                .from("follows")
                .select("*", { count: "exact", head: true })
                .eq("author_id", id);
            if (count !== null) setFollowerCount(count);

            if (currentId && currentId !== id) {
                const { data: followData } = await supabase
                    .from("follows")
                    .select("*")
                    .eq("follower_id", currentId)
                    .eq("author_id", id)
                    .single();
                if (followData) setIsFollowing(true);
            }

            setLoading(false);
        }
        loadData();
    }, [id]);

    const handleFollow = async () => {
        if (!currentUserId) {
            alert("Please log in to follow authors.");
            router.push("/login");
            return;
        }
        if (isFollowing) {
            await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("author_id", id);
            setIsFollowing(false);
            setFollowerCount(prev => prev - 1);
        } else {
            await supabase.from("follows").insert({ follower_id: currentUserId, author_id: id });
            setIsFollowing(true);
            setFollowerCount(prev => prev + 1);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center text-[var(--foreground)]">
            <h1 className="text-2xl font-bold mb-4">Poet not found</h1>
            <button onClick={() => router.push("/")} className="text-primary hover:underline">Return Home</button>
        </div>
    );

    const isOwnProfile = currentUserId === id;

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center p-6 pb-20">
            <Navbar />

            <div className="w-full max-w-2xl mt-24">
                {/* Profile Header */}
                <div className="bg-[var(--card)] p-8 rounded-3xl shadow-md border border-[var(--border)] relative overflow-hidden mb-8">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                        <div className="w-24 h-24 bg-primary/20 rounded-full border-4 border-[var(--background)] flex items-center justify-center text-primary shadow-inner">
                            <User size={40} />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-serif font-bold text-[var(--foreground)] mb-2">
                                {profile.username}
                            </h1>
                            <p className="text-[var(--muted-foreground)] mb-4 max-w-md">
                                {profile.bio || "A quiet soul writing poetry under the moonlight."}
                            </p>

                            <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                                <div className="flex flex-col items-center md:items-start">
                                    <span className="font-bold text-[var(--foreground)] text-lg">{poems.length}</span>
                                    <span className="text-[var(--muted-foreground)]">Poems</span>
                                </div>
                                <div className="w-px h-8 bg-[var(--border)]"></div>
                                <div className="flex flex-col items-center md:items-start">
                                    <span className="font-bold text-[var(--foreground)] text-lg">{followerCount}</span>
                                    <span className="text-[var(--muted-foreground)]">Followers</span>
                                </div>
                            </div>
                        </div>

                        {!isOwnProfile && (
                            <button
                                onClick={handleFollow}
                                className={`mt-4 md:mt-0 flex items-center gap-2 px-6 py-2.5 rounded-full font-medium shadow-sm transition-all active:scale-95 ${isFollowing
                                        ? "bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)]"
                                        : "bg-primary text-white hover:bg-orange-600 shadow-md"
                                    }`}
                            >
                                {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Poems Grid */}
                <div className="flex items-center gap-3 mb-6 px-2">
                    <BookOpen className="text-primary" size={20} />
                    <h2 className="text-xl font-semibold text-[var(--foreground)]">Published Works</h2>
                </div>

                {poems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {poems.map(poem => (
                            <div key={poem.id} className="bg-[var(--card)] p-6 rounded-2xl shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-serif font-bold text-[var(--foreground)] mb-3 line-clamp-1">
                                    {poem.title}
                                </h3>
                                <p className="text-[var(--muted-foreground)] text-sm whitespace-pre-wrap line-clamp-4 font-serif">
                                    {poem.content}
                                </p>
                                <div className="mt-4 pt-3 border-t border-[var(--border)]/50 flex justify-between items-center">
                                    <span className="text-xs text-[var(--muted-foreground)]">
                                        {/* Date formatting could be added here */}
                                        Moonlit Classic
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-[var(--card)]/50 rounded-2xl border border-[var(--border)] border-dashed">
                        <p className="text-[var(--muted-foreground)]">This poet hasn't shared any verses yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
