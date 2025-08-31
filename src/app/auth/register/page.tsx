import { AnimatedBackground } from '@/components/AnimatedBackground';
import { AuthScreen } from '@/components/AuthScreen';

export default function RegisterPage() {
	return (
		<div className="relative min-h-dvh overflow-hidden">
			<AnimatedBackground />
			<AuthScreen />
		</div>
	);
}


