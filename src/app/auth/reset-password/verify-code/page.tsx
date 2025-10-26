import { AnimatedBackground } from '@/components/shared/AnimatedBackground';
import { VerifyCodeScreen } from '@/components/shared/modals/VerifyCodeScreen';

export default function VerifyCodePage() {
    return (
        <div className="relative min-h-dvh overflow-hidden">
            <AnimatedBackground />
            <VerifyCodeScreen />
        </div>
    );
} 
