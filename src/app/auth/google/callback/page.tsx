'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/features/auth';
import { LoadingGrid } from '@/components/ui/loading-grid';

export default function GoogleCallbackPage() {
    const router = useRouter();
    const { login } = useAuth();

    useEffect(() => {

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const name = urlParams.get('name');
        const email = urlParams.get('email');

        if (token && name && email) {

            const user = {
                id: email,
                name,
                nome: name,
                email,
                age: 25,
                educationLevel: 'GRADUACAO' as const,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            login(token, user, true);

            window.history.replaceState({}, document.title, '/dashboard');

            router.push('/dashboard');

        } else {

            router.push('/auth/login');
        }
    }, [login, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="text-center">
                <LoadingGrid size="60" color="#B3E240" />
                <p className="text-white text-lg mt-4">Processando login com Google...</p>
            </div>
        </div>
    );
}
