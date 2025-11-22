'use client';

import { ProfileBadgesProps } from '@/types/ui/features/profile';

export function ProfileBadges({ badges }: ProfileBadgesProps) {
    return (
        <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#bd18b4]/5 before:to-transparent before:pointer-events-none">
            <h3 className="text-white font-semibold mb-4">Insígnias • 3</h3>
            <div className="flex space-x-3">
                {badges.map((badge) => (
                    <div
                        key={badge.id}
                        className={`w-12 h-12 ${badge.color} rounded-full flex items-center justify-center cursor-pointer`}
                    >
                        <span className="text-black text-xs font-bold">{badge.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
