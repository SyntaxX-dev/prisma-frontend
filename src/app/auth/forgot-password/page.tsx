import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { ForgotPasswordScreen } from '@/components/features/auth/ForgotPasswordScreen';

export default function ForgotPasswordPage() {
    return (
        <div className="relative min-h-dvh overflow-hidden">
            <AnimatedBackground />
            <ForgotPasswordScreen />
        </div>
    );
} 
