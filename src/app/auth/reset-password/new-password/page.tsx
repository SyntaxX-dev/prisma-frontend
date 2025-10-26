import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { NewPasswordScreen } from '@/components/features/auth/NewPasswordScreen';

export default function NewPasswordPage() {
	return (
		<div className="relative min-h-dvh overflow-hidden">
			<AnimatedBackground />
			<NewPasswordScreen />
		</div>
	);
} 
