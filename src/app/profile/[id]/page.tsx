"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { UserPlus, UserCheck, BookOpen, User, Heart, Trash2, X } from "lucide-react";
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
    const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);

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
                    author_name: p.users?.username,
                    like_count: p.like_count
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
        if (currentUserId === id) {
            alert("You cannot follow yourself.");
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

    const handleLike = async (poemId: string) => {
        if (!currentUserId) {
            alert("Please log in to like poems.");
            return;
        }

        // Optimistically update UI first to feel responsive
        setPoems(prev => prev.map(p => p.id === poemId ? { ...p, like_count: (p.like_count || 0) + 1 } : p));
        if (selectedPoem && selectedPoem.id === poemId) {
            setSelectedPoem({ ...selectedPoem, like_count: (selectedPoem.like_count || 0) + 1 });
        }

        const { error } = await supabase.from("likes").insert({ user_id: currentUserId, poem_id: poemId });
        if (error) {
            // Revert on failure
            setPoems(prev => prev.map(p => p.id === poemId ? { ...p, like_count: Math.max((p.like_count || 1) - 1, 0) } : p));
            if (selectedPoem && selectedPoem.id === poemId) {
                setSelectedPoem({ ...selectedPoem, like_count: Math.max((selectedPoem.like_count || 1) - 1, 0) });
            }
            if (error.code === '23505') alert("You already liked this poem!");
            else console.error(error);
        }
    };

    const handleDelete = async (poemId: string) => {
        if (!currentUserId || currentUserId !== id) return;
        if (!confirm("Are you sure you want to delete this poem?")) return;

        const { error } = await supabase.from("poems").delete().eq("id", poemId);
        if (!error) {
            setPoems(prev => prev.filter(p => p.id !== poemId));
            setSelectedPoem(null);
        } else {
            console.error(error);
            alert("Failed to delete poem");
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
                            <div
                                key={poem.id}
                                onClick={() => setSelectedPoem(poem)}
                                className="bg-[var(--card)] p-6 rounded-2xl shadow-sm border border-[var(--border)] hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                            >
                                <h3 className="text-lg font-serif font-bold text-[var(--foreground)] mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                                    {poem.title}
                                </h3>
                                <p className="text-[var(--muted-foreground)] text-sm whitespace-pre-wrap line-clamp-4 font-serif">
                                    {poem.content}
                                </p>
                                <div className="mt-4 pt-3 border-t border-[var(--border)]/50 flex justify-between items-center">
                                    <span className="text-xs text-[var(--muted-foreground)]">Moonlit Collection</span>
                                    <span className="flex items-center gap-1 text-xs text-red-500/80 font-medium">
                                        <Heart size={12} fill="currentColor" /> {poem.like_count || 0}
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

            {/* Full Poem Modal */}
            {selectedPoem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--card)] w-full max-w-lg max-h-[85vh] rounded-3xl shadow-2xl border border-[var(--border)] flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setSelectedPoem(null)}
                            className="absolute top-4 right-4 p-2 bg-[var(--background)] hover:bg-[var(--border)] rounded-full text-[var(--foreground)] transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 overflow-y-auto flex-1">
                            <h2 className="text-3xl font-serif font-bold text-[var(--foreground)] text-center mb-6">{selectedPoem.title}</h2>
                            <div className="w-24 h-px bg-primary/30 mx-auto mb-6"></div>
                            <p className="text-lg whitespace-pre-wrap text-[var(--foreground)] leading-relaxed font-serif text-center">
                                {selectedPoem.content}
                            </p>
                            <div className="mt-12 text-center text-[var(--muted-foreground)] text-sm font-medium">
                                ~ {selectedPoem.author_name || profile.username}
                            </div>
                        </div>

                        <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]/50 rounded-b-3xl flex items-center justify-between">
                            <button
                                onClick={() => handleLike(selectedPoem.id)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-full font-medium shadow-sm transition-all active:scale-95 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:scale-105"
                            >
                                <Heart size={18} fill="currentColor" className="animate-pulse" />
                                {selectedPoem.like_count || 0} Likes
                            </button>

                            {isOwnProfile && (
                                <button
                                    onClick={() => handleDelete(selectedPoem.id)}
                                    className="flex items-center p-2.5 text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete Poem"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
