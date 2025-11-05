'use client';

import { AppShell } from '@/components/layout/AppShell';
import { usePathname } from 'next/navigation';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	if (pathname === '/profile' || pathname === '/communities') {
		return <>{children}</>;
	}

	return <AppShell>{children}</AppShell>;
}



