"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";
import { LearningDashboard } from "../../../components/LearningDashboard";
import { useAuth } from "../../../hooks/useAuth";
import { usePageDataLoad } from "@/hooks/usePageDataLoad";

function DashboardContent() {
	const [isDark, setIsDark] = useState(true);
	const { login, user } = useAuth();

	const toggleTheme = () => {
		setIsDark(!isDark);
	};

	usePageDataLoad({
		waitForData: false,
		customDelay: 0
	});

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

		}
	}, [login]);

	return (
		<div className={`min-h-screen ${isDark ? 'dark' : ''}`}>

			<div
				className={`fixed inset-0 transition-all duration-300 ${isDark
					? 'bg-gray-950'
					: 'bg-gray-500'
					}`}
				style={{
					backgroundImage: isDark
						? `
				radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.08) 0%, transparent 50%),
				radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.04) 0%, transparent 50%)
			  `
						: `
				radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.1) 0%, transparent 50%),
				radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.05) 0%, transparent 50%)
			  `
				}}
			/>

			<div
				className="fixed inset-0 pointer-events-none"
				aria-hidden="true"
				style={{
					backgroundImage: `
						radial-gradient(circle at 15% 10%, rgba(201, 254, 2, 0.06), transparent 20%),
						radial-gradient(circle at 85% 90%, rgba(201, 254, 2, 0.04), transparent 20%)
					`
				}}
			/>

			<div
				className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-black/30' : 'bg-black/10'
					}`}
			/>

			<div
				className="fixed inset-0 pointer-events-none"
				aria-hidden="true"
				style={{
					backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
					backgroundSize: '24px 24px',
					backgroundPosition: '0 0'
				}}
			/>

			<div className="relative z-10 flex">
				<Sidebar isDark={isDark} toggleTheme={toggleTheme} />
				<div className="flex-1">
					<Navbar isDark={isDark} toggleTheme={toggleTheme} />
					<div style={{ marginTop: '80px' }}>
						<LearningDashboard userName={user?.name} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default function DashboardPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-gray-950 flex items-center justify-center">
				<div className="text-white text-lg">Carregando...</div>
			</div>
		}>
			<DashboardContent />
		</Suspense>
	);
}

