'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { ProfileCompletionProps } from '@/types/ui/features/profile';

export function ProfileCompletion({
    profileTasks,
    completionPercentage,
    completedTasks,
    totalTasks,
    onTaskClick
}: ProfileCompletionProps) {
    return (
        <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#bd18b4]/5 before:to-transparent before:pointer-events-none">
            <h2 className="text-xl font-bold text-white mb-2">Complete seu perfil</h2>
            <p className="text-gray-400 text-sm mb-6">Perfis completos atraem mais oportunidades!</p>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 text-sm">{completionPercentage}% completo</span>
                    <span className="text-gray-400 text-sm">{completedTasks} de {totalTasks}</span>
                </div>
                <div className="w-full bg-[#323238] rounded-full h-2">
                    <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileTasks.map((task, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                        onClick={() => onTaskClick(task.label)}
                    >
                        {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <Circle className="w-5 h-5 text-gray-600" />
                        )}
                        <span className={`text-sm ${task.completed ? 'text-white' : 'text-gray-400'}`}>
                            {task.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
