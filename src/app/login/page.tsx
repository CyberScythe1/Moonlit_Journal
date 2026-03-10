"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Moon } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) setError(error.message);
            else router.push("/");
        } else {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) setError(error.message);
            else {
                // Create user record in our database
                if (data.user) {
                    const { error: dbError } = await supabase.from('users').insert({
                        id: data.user.id,
                        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
                    });
                    if (dbError) {
                        console.error('Failed to create user profile:', dbError);
                    }
                }
                alert("Signup successful! Please log in.");
                setIsLogin(true);
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)]">
            <div className="w-full max-w-sm bg-[var(--card)] p-8 rounded-3xl shadow-lg border border-[var(--border)] relative overflow-hidden">
                {/* Decorative circle glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-inner">
                        <Moon size={32} />
                    </div>
                </div>

                <h1 className="text-2xl font-semibold text-center mb-2 text-[var(--foreground)]">
                    {isLogin ? "Welcome Back" : "Join Moonlit Journal"}
                </h1>
                <p className="text-center text-sm text-[var(--muted-foreground)] mb-8">
                    Share your poetry under the warm night sky
                </p>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm mb-4 border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-primary/50 text-[var(--foreground)] transition"
                            placeholder="poet@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-primary/50 text-[var(--foreground)] transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-orange-600 text-white font-medium py-3 rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-70 mt-4"
                    >
                        {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary font-medium hover:underline ml-1"
                    >
                        {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
}
