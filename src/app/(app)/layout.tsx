'use client';

import { AppShell } from '@/components/layout/AppShell';
import { usePathname } from 'next/navigation';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	// Para a página de perfil, não usar AppShell (sem sidebar)
	if (pathname === '/profile') {
		return <>{children}</>;
	}

	return <AppShell>{children}</AppShell>;
}



