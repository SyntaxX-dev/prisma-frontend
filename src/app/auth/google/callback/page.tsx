'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/features/auth';
import { getProfile } from '@/api/auth/get-profile';
import { LoadingGrid } from '@/components/ui/loading-grid';
import { CACHE_TAGS } from '@/lib/cache/invalidate-tags';

function GoogleCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [tokenFromUrl, setTokenFromUrl] = useState<string | null>(null);
    const hasLoggedInRef = useRef(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('auth_token', token);
            }
            setTokenFromUrl(token);
        } else {
            router.push('/auth/login');
        }
    }, [searchParams, router]);

    const { data: profile, isSuccess, isError } = useQuery({
        queryKey: [CACHE_TAGS.USER_PROFILE, 'oauth', tokenFromUrl],
        queryFn: () => getProfile(),
        enabled: !!tokenFromUrl && !hasLoggedInRef.current,
        staleTime: 0,
        retry: false,
    });

    useEffect(() => {
        if (isSuccess && profile && tokenFromUrl && !hasLoggedInRef.current) {
            hasLoggedInRef.current = true;
            login(tokenFromUrl, profile, true);
            window.history.replaceState({}, document.title, '/dashboard');
            router.push('/dashboard');
        }
    }, [isSuccess, profile, tokenFromUrl, login, router]);

    useEffect(() => {
        if (isError) {
            router.push('/auth/login');
        }
    }, [isError, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="text-center">
                <LoadingGrid size="60" color="#bd18b4" />
                <p className="text-white text-lg mt-4">Processando login com Google...</p>
            </div>
        </div>
    );
}

const fallback = (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
            <LoadingGrid size="60" color="#bd18b4" />
            <p className="text-white text-lg mt-4">Processando login com Google...</p>
        </div>
    </div>
);

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={fallback}>
            <GoogleCallbackContent />
        </Suspense>
    );
}
