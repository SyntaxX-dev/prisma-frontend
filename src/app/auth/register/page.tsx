'use client';

import { AuthScreen } from '@/components/features/auth/AuthScreen';
import { LoadingGrid } from '@/components/ui/loading-grid';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { validateRegistrationToken } from '@/api/auth/validate-registration-token';

function RegisterPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [isValidToken, setIsValidToken] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [expiresAt, setExpiresAt] = useState<Date | null>(null);
	const token = searchParams.get('token');

	useEffect(() => {
		const validateToken = async () => {
			if (!token) {
				setError('Token de registro não fornecido. Por favor, use o link enviado por email após o pagamento.');
				setIsLoading(false);
				return;
			}

			try {
				const response = await validateRegistrationToken(token);
				if (response.valid) {
					setIsValidToken(true);
					if (response.expiresAt) {
						setExpiresAt(new Date(response.expiresAt));
					}
				} else {
					setError(response.message || 'Token inválido ou expirado. Por favor, entre em contato com o suporte.');
				}
			} catch (err: any) {
				setError(err?.message || 'Erro ao validar token. Por favor, tente novamente.');
			} finally {
				setIsLoading(false);
			}
		};

		validateToken();
	}, [token]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center">
				<div className="text-center">
					<LoadingGrid size="80" color="#bd18b4" />
					<p className="text-white mt-4 text-sm md:text-base">Validando token de registro...</p>
				</div>
			</div>
		);
	}

	if (error || !isValidToken) {
		return (
			<div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center p-4">
				<div className="max-w-md w-full bg-[#202024] rounded-2xl p-6 md:p-8 text-center">
					<h1 className="text-xl md:text-2xl font-bold text-white mb-4">Acesso Negado</h1>
					<p className="text-gray-400 mb-6 text-sm md:text-base">{error || 'Token inválido'}</p>
					<p className="text-gray-500 mb-6 text-xs md:text-sm">
						Por favor, verifique o link do email ou entre em contato com o suporte.
					</p>
					<button
						onClick={() => router.push('/')}
						className="bg-[#bd18b4] hover:bg-[#aa22c5] text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm md:text-base"
					>
						Voltar para Home
					</button>
				</div>
			</div>
		);
	}

	return <AuthScreen mode="register" registrationToken={token || undefined} expiresAt={expiresAt || undefined} />;
}

export default function RegisterPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center">
				<div className="text-center">
					<LoadingGrid size="80" color="#bd18b4" />
				</div>
			</div>
		}>
			<RegisterPageContent />
		</Suspense>
	);
}