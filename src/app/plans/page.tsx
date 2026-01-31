'use client';

import { Pricing } from '@/components/landing/Pricing';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BackgroundGrid } from '@/components/shared/BackgroundGrid';

export default function PlansPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-transparent relative overflow-hidden flex flex-col items-center justify-center pb-60">
      <BackgroundGrid />
      {/* Back Button */}
      <div className="absolute top-6 left-4 md:left-8 z-30">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 bg-[#202024] hover:bg-[#29292E] border border-[#323238] hover:border-[#8b5cf6]/40 text-white rounded-xl transition-all duration-300 group cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Voltar para Home</span>
        </button>
      </div>
      <Pricing />
    </div>
  );
}
