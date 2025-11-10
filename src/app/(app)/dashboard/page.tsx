"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/layout";
import { Sidebar } from "@/components/Sidebar";
import { LearningDashboard } from "@/components/features/dashboard";
import DotGrid from "@/components/shared/DotGrid";
import { LoadingGrid } from "@/components/ui/loading-grid";
import { useAuth } from "../../../hooks/features/auth";
import { usePageDataLoad } from "@/hooks/shared";

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
		<div className="min-h-screen  text-white relative">
			{/* DotGrid Background */}
			<div className="fixed inset-0 z-0">
				<DotGrid
					dotSize={1}
					gap={24}
					baseColor="rgba(255,255,255,0.25)"
					activeColor="#B3E240"
					proximity={120}
					shockRadius={250}
					shockStrength={5}
					resistance={750}
					returnDuration={1.5}
				/>
			</div>

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
			<div className="min-h-screen flex items-center justify-center">
				<LoadingGrid size="60" color="#B3E240" />
			</div>
		}>
			<DashboardContent />
		</Suspense>
	);
}

