"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout";
import { Sidebar } from "@/components/Sidebar";
import { LearningDashboard } from "@/components/features/dashboard";
import { BackgroundGrid } from "@/components/shared/BackgroundGrid";
import { LoadingGrid } from "@/components/ui/loading-grid";
import { useAuth } from "../../../hooks/features/auth";
import { usePageDataLoad } from "@/hooks/shared";
import { getProfile } from "@/api/auth/get-profile";
import { CACHE_TAGS } from "@/lib/cache/invalidate-tags";

function DashboardContent() {
	const [isDark, setIsDark] = useState(true);
	const searchParams = useSearchParams();
	const { login, user } = useAuth();
	const [tokenFromUrl, setTokenFromUrl] = useState<string | null>(null);
	const hasLoggedInRef = useRef(false);

	const toggleTheme = () => {
		setIsDark(!isDark);
	};

	usePageDataLoad({
		waitForData: false,
		customDelay: 0
	});

	useEffect(() => {
		const token = searchParams.get('token');
		if (token && typeof window !== 'undefined') {
			window.localStorage.setItem('auth_token', token);
			setTokenFromUrl(token);
		}
	}, [searchParams]);

	const { data: profile, isSuccess } = useQuery({
		queryKey: [CACHE_TAGS.USER_PROFILE, 'oauth', tokenFromUrl],
		queryFn: () => getProfile(),
		enabled: !!tokenFromUrl && !hasLoggedInRef.current,
		staleTime: 0,
		retry: false,
	});

	useEffect(() => {
		if (isSuccess && profile && tokenFromUrl && !hasLoggedInRef.current) {
			hasLoggedInRef.current = true;
			login(tokenFromUrl, profile, true);
			window.history.replaceState({}, document.title, '/dashboard');
		}
	}, [isSuccess, profile, tokenFromUrl, login]);

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

