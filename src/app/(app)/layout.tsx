'use client';

import { AppShell } from '@/components/layout/AppShell';
import { usePathname } from 'next/navigation';
import { UserStatusProvider } from '@/providers/UserStatusProvider';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	const content =
		pathname === '/profile' || pathname === '/communities' ? (
			<>{children}</>
		) : (
			<AppShell>{children}</AppShell>
		);

	return (
		<UserStatusProvider>
			<NotificationsProvider>
				{content}
			</NotificationsProvider>
		</UserStatusProvider>
	);
}



