import { Suspense } from 'react';
import { CheckoutPage } from '@/components/features/checkout/CheckoutPage';

export default function CheckoutRoute() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center text-white">Carregando...</div>}>
            <CheckoutPage />
        </Suspense>
    );
}
