import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-dvh flex">
			<Sidebar />
			<div className="flex-1 flex flex-col">
				<main className="p-6">{children}</main>
			</div>
		</div>
	);
}



