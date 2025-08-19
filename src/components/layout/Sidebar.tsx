import Link from 'next/link';

export function Sidebar() {
	return (
		<aside className="w-60 border-r min-h-dvh p-4 hidden md:block">
			<nav className="space-y-2 text-sm">
				<Link href="/" className="block hover:underline">Início</Link>
				<Link href="/dashboard" className="block hover:underline">Dashboard</Link>
				<Link href="/guides" className="block hover:underline">Guias</Link>
				<Link href="/profile" className="block hover:underline">Perfil</Link>
				<Link href="/settings" className="block hover:underline">Configurações</Link>
			</nav>
		</aside>
	);
}



