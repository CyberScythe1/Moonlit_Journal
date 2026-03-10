import { motion, AnimatePresence } from "framer-motion";
import { Hand, Heart, X, BookOpen } from "lucide-react";

interface GuestTutorialOverlayProps {
    onDismiss: () => void;
}

export default function GuestTutorialOverlay({ onDismiss }: GuestTutorialOverlayProps) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                onClick={onDismiss}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[var(--card)] w-full max-w-sm rounded-[2rem] shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col items-center p-8 relative"
                >
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 shadow-inner">
                        <BookOpen size={32} />
                    </div>

                    <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] mb-2 text-center">
                        Welcome to Moonlit
                    </h2>
                    <p className="text-[var(--muted-foreground)] text-center mb-8 text-sm">
                        Discover poetry under the night sky. Here is how to navigate:
                    </p>

                    <div className="w-full space-y-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 text-green-600 p-3 rounded-full shadow-sm shrink-0">
                                <Heart size={20} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--foreground)]">Swipe Left</h3>
                                <p className="text-xs text-[var(--muted-foreground)]">To <strong className="text-green-600 font-medium">Like</strong> a poem and save it to the author's collection.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-red-100 text-red-600 p-3 rounded-full shadow-sm shrink-0">
                                <X size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--foreground)]">Swipe Right</h3>
                                <p className="text-xs text-[var(--muted-foreground)]">To <strong className="text-red-600 font-medium">Skip</strong> and discover the next piece.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 text-primary p-3 rounded-full shadow-sm shrink-0">
                                <Hand size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[var(--foreground)]">Tap Author</h3>
                                <p className="text-xs text-[var(--muted-foreground)]">Click the author's name at the bottom to view their full profile.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onDismiss}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-medium py-3.5 rounded-xl shadow-md transition-transform active:scale-95"
                    >
                        Start Reading
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
