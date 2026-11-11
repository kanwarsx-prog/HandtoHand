'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/client';

type AuthContextType = {
    user: { id: string; email: string; name?: string | null } | null;
    loading: boolean;
    signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthContextType['user']>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authClient.getSession()
            .then(({ data }) => setUser(data?.user ?? null))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const signUp = async (email: string, password: string, displayName: string) => {
        try {
            const { error } = await authClient.signUp.email({ email, password, name: displayName });
            return { error: error ? new Error(error.message || 'Sign-up failed') : null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await authClient.signIn.email({ email, password });
            return { error: error ? new Error(error.message || 'Sign-in failed') : null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        await authClient.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
