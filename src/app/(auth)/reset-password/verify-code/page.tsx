import { AnimatedBackground } from '@/components/AnimatedBackground';
import { VerifyCodeScreen } from '@/components/VerifyCodeScreen';

export default function VerifyCodePage() {
    return (
        <div className="relative min-h-dvh overflow-hidden">
            <AnimatedBackground />
            <VerifyCodeScreen />
        </div>
    );
} 
