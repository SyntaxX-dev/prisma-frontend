import { Suspense } from 'react';
import { CheckoutPage } from '@/components/features/checkout/CheckoutPage';
import { BackgroundGrid } from '@/components/shared/BackgroundGrid';

export default function CheckoutRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-transparent flex items-center justify-center text-white">Carregando...</div>}>
            <BackgroundGrid />
            <CheckoutPage />
        </Suspense>
    );
}
