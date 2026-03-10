"use client";

import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { useEffect } from "react";

import { Heart, X, UserPlus } from "lucide-react";

export interface Poem {
    id: string;
    title: string;
    content: string;
    author_id: string;
    author_name?: string;
    like_count?: number;
}

interface SwipeCardProps {
    poem: Poem;
    onLike: (poem: Poem) => void;
    onSkip: (poem: Poem) => void;
    onToggleFollow: (poem: Poem) => void;
    isFollowing: boolean;
    isOwnPoem: boolean;
    active: boolean;
    zIndex: number;
}

export default function SwipeCard({ poem, onLike, onSkip, onToggleFollow, isFollowing, isOwnPoem, active, zIndex }: SwipeCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);

    // Custom requirement: Swipe Left = Like, Swipe Right = Skip
    const likeOpacity = useTransform(x, [-100, -50, 0], [1, 0, 0]);
    const skipOpacity = useTransform(x, [0, 50, 100], [0, 0, 1]);

    const controls = useAnimation();

    useEffect(() => {
        controls.start({ x: 0, y: active ? 0 : 20, scale: active ? 1 : 0.95, opacity: 1, transition: { duration: 0.3 } });
    }, [active, controls]);

    const handleDragEnd = async (e: any, info: any) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        if (offset < -100 || velocity < -500) {
            await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
            onLike(poem);
        } else if (offset > 100 || velocity > 500) {
            await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
            onSkip(poem);
        } else {
            controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
        }
    };

    return (
        <motion.div
            className="absolute top-0 w-full h-[65vh] max-w-md mx-auto aspect-[3/4] bg-[var(--card)] rounded-3xl shadow-xl border border-[var(--border)] overflow-hidden flex flex-col items-center justify-center p-8 origin-bottom"
            style={{ x, rotate, zIndex, touchAction: "none" }}
            drag={active ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            animate={controls}
            whileTap={active ? { cursor: "grabbing" } : { cursor: "grab" }}
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
        >
            {/* Overlays */}
            <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 right-8 z-10 pointer-events-none">
                <div className="bg-green-100 text-green-600 p-4 rounded-full shadow-lg border-2 border-green-200">
                    <Heart size={40} fill="currentColor" />
                </div>
            </motion.div>
            <motion.div style={{ opacity: skipOpacity }} className="absolute top-8 left-8 z-10 pointer-events-none">
                <div className="bg-red-100 text-red-600 p-4 rounded-full shadow-lg border-2 border-red-200">
                    <X size={40} />
                </div>
            </motion.div>

            <div className="flex-1 flex flex-col items-center justify-center w-full text-center space-y-6">
                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] mt-4">{poem.title}</h2>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent"></div>
                <div className="flex-1 w-full flex items-center justify-center overflow-y-auto py-2">
                    <p className="text-lg whitespace-pre-wrap text-[var(--foreground)] leading-relaxed font-serif text-center">
                        {poem.content}
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border)]/50 w-full flex flex-col items-center gap-3 pb-2 z-20">
                <div className="flex items-center justify-center gap-4 text-sm font-medium text-[var(--muted-foreground)] w-full">
                    <span>~ {poem.author_name || "Unknown Poet"}</span>
                    <span className="flex items-center gap-1.5 text-red-500/80 bg-red-500/10 px-2 py-0.5 rounded-full">
                        <Heart size={14} fill="currentColor" /> {poem.like_count || 0}
                    </span>
                </div>
                {!isOwnPoem && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFollow(poem); }}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium shadow-sm transition-all active:scale-95 ${isFollowing
                                ? 'bg-[var(--border)] text-[var(--foreground)] hover:brightness-95'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                            }`}
                    >
                        <UserPlus size={16} />
                        {isFollowing ? 'Unfollow' : 'Follow Author'}
                    </button>
                )}
            </div>
        </motion.div>
    );
}
