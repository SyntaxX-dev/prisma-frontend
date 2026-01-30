"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/layout";
import { Sidebar } from "@/components/Sidebar";
import { LearningDashboard } from "@/components/features/dashboard";
import { BackgroundGrid } from "@/components/shared/BackgroundGrid";
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
		<div className="min-h-screen text-white relative">
			<BackgroundGrid />

			<div className="relative z-10 flex min-h-screen">
				<Sidebar isDark={isDark} toggleTheme={toggleTheme} />
				<div className="flex-1 flex flex-col relative">
					<Navbar isDark={isDark} toggleTheme={toggleTheme} />
					<main className="flex-1 w-full pt-24 md:pt-10">
						<LearningDashboard userName={user?.name} />
					</main>
				</div>
			</div>
		</div>
	);
}

export default function DashboardPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen flex items-center justify-center">
				<LoadingGrid size="60" color="#bd18b4" />
			</div>
		}>
			<DashboardContent />
		</Suspense>
	);
}

