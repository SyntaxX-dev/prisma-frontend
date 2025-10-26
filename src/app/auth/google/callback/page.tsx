'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/features/auth';

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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B3E240] mx-auto mb-4"></div>
                <p className="text-white text-lg">Processando login com Google...</p>
            </div>
        </div>
    );
}
