'use client';

import { AuthScreen } from '@/components/features/auth/AuthScreen';
import { LoadingGrid } from '@/components/ui/loading-grid';
import { useState, useEffect } from 'react';

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Simular carregamento
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center">
				<div className="text-center">
					<LoadingGrid size="80" color="#bd18b4" />
				</div>
			</div>
		);
	}

	return <AuthScreen mode="login" />;
}

