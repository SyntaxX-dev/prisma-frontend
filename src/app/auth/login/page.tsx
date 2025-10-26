import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { AuthScreen } from '@/components/features/auth/AuthScreen';

export default function LoginPage() {
	return (
		<div className="relative min-h-dvh overflow-hidden">
			<AnimatedBackground />
			<AuthScreen />
		</div>
	);
}


