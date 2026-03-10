"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import SwipeCard, { Poem } from "@/components/SwipeCard";
import { AnimatePresence } from "framer-motion";

export default function DiscoverPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [followedAuthorIds, setFollowedAuthorIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        const { data: follows } = await supabase.from('follows').select('author_id').eq('follower_id', data.user.id);
        if (follows) {
          setFollowedAuthorIds(new Set(follows.map(f => f.author_id)));
        }
      }
    }
    loadUser();
    fetchPoems();
  }, []);

  const fetchPoems = async () => {
    setLoading(true);
    // Fetch recent poems
    const { data: poemsData, error } = await supabase
      .from("poems")
      .select("*, users(username)")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && poemsData) {
      const formatted = poemsData.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        author_id: p.author_id,
        author_name: p.users?.username,
        like_count: p.like_count
      }));
      setPoems(formatted);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  const handleLike = async (poem: Poem) => {
    setPoems(prev => prev.filter(p => p.id !== poem.id));
    if (!userId) return;
    const { error } = await supabase.from("likes").insert({ user_id: userId, poem_id: poem.id });
    if (error) console.error(error);
    // In a real app we'd also increment the like_count
  };

  const handleSkip = async (poem: Poem) => {
    setPoems(prev => prev.filter(p => p.id !== poem.id));
  };

  const handleToggleFollow = async (poem: Poem) => {
    if (!userId) {
      alert("Please log in to follow authors.");
      return;
    }
    const authorId = poem.author_id;
    if (authorId === userId) {
      alert("You cannot follow yourself.");
      return;
    }

    const isFollowing = followedAuthorIds.has(authorId);

    if (isFollowing) {
      // Unfollow
      const { error } = await supabase.from("follows")
        .delete()
        .eq('follower_id', userId)
        .eq('author_id', authorId);

      if (error) alert("Could not unfollow: " + error.message);
      else {
        setFollowedAuthorIds(prev => {
          const next = new Set(prev);
          next.delete(authorId);
          return next;
        });
      }
    } else {
      // Follow
      const { error } = await supabase.from("follows").insert({ follower_id: userId, author_id: authorId });

      if (error) alert("Could not follow: " + error.message);
      else {
        setFollowedAuthorIds(prev => {
          const next = new Set(prev);
          next.add(authorId);
          return next;
        });
      }
    }
  };

  const activePoem = poems[0];

  return (
    <div className="fixed inset-0 bg-[var(--background)] flex flex-col items-center justify-center">
      <Navbar showReport={!!activePoem} onReport={() => alert("Report sent.")} />

      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="relative w-full max-w-md h-[80vh] flex items-center justify-center px-4 z-10 mt-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-[var(--muted-foreground)] font-medium animate-pulse">Gathering poetry...</p>
          </div>
        ) : poems.length > 0 ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence>
              {poems.map((poem, index) => {
                if (index > 2) return null; // Only render top 3 for performance
                return (
                  <SwipeCard
                    key={poem.id}
                    poem={poem}
                    active={index === 0}
                    zIndex={poems.length - index}
                    onLike={handleLike}
                    onSkip={handleSkip}
                    onToggleFollow={handleToggleFollow}
                    isFollowing={followedAuthorIds.has(poem.author_id)}
                    isOwnPoem={poem.author_id === userId}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center p-8 bg-[var(--card)] rounded-3xl border border-[var(--border)] w-full shadow-md z-10 transition-all">
            <h3 className="text-xl font-serif font-bold text-[var(--foreground)] mb-3">No more poems</h3>
            <p className="text-[var(--muted-foreground)] mb-8">The sky is clear. Check back later for new poetry under the moonlight.</p>
            <button
              onClick={fetchPoems}
              className="px-8 py-3 bg-primary text-white rounded-full font-medium shadow-md hover:shadow-lg active:scale-95 transition-all w-full"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

