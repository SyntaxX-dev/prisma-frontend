'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '../../../ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../../../ui/select';
import {
    UserFocus,
    ContestType,
    CollegeCourse,
    ApiEducationLevel,
    USER_FOCUS_LABELS,
    CONTEST_TYPE_LABELS,
    COLLEGE_COURSE_LABELS,
    EDUCATION_LEVEL_LABELS
} from '@/types/api/auth-api';
import { updateProfile } from '@/api/profile/update-profile';
import { getProfile } from '@/api/auth/get-profile';
import { getContestOptions } from '@/api/options/get-contest-options';
import { getCollegeCourseOptions } from '@/api/options/get-college-course-options';
import { useAuth } from '@/hooks/features/auth';
import { useCacheInvalidation } from '@/hooks/shared';
import { toast } from 'sonner';
import { CheckCircle, Award } from 'lucide-react';

interface ProfileCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    notificationData: {
        hasNotification: boolean;
        missingFields: string[];
        message: string;
        badge: string | null;
    };
}

function buildNotificationMessage(
    hasNotification: boolean,
    missingFields: string[],
    profileCompletionPercentage: number
): string {
    if (!hasNotification || missingFields.length === 0) {
        return `Perfil ${profileCompletionPercentage}% completo!`;
    }
    if (missingFields.length === 1) {
        return `Complete seu perfil adicionando sua ${missingFields[0]}.`;
    }
    const fieldsCopy = [...missingFields];
    const lastField = fieldsCopy.pop();
    return `Complete seu perfil adicionando suas informações: ${fieldsCopy.join(', ')} e ${lastField}.`;
}

export function ProfileCompletionModal({
    isOpen,
    onClose,
    notificationData
}: ProfileCompletionModalProps) {
    const router = useRouter();
    const { user, updateUser } = useAuth();
    const { profile } = useCacheInvalidation();
    const [userFocus, setUserFocus] = useState<UserFocus | ''>('');
    const [contestType, setContestType] = useState<ContestType | ''>('');
    const [collegeCourse, setCollegeCourse] = useState<CollegeCourse | ''>('');
    const [educationLevel, setEducationLevel] = useState<ApiEducationLevel | ''>('');

    const needsEducationLevel = notificationData.missingFields.includes('nível de educação');
    const needsUserFocus = notificationData.missingFields.includes('foco de estudo');
    const [contestOptions, setContestOptions] = useState<Array<{ value: ContestType; label: string }>>([]);
    const [collegeOptions, setCollegeOptions] = useState<Array<{ value: CollegeCourse; label: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadOptions();
        }
    }, [isOpen]);

    const getLocalContestOptions = (): Array<{ value: ContestType; label: string }> =>
        Object.entries(CONTEST_TYPE_LABELS).map(([value, label]) => ({ value: value as ContestType, label }));

    const getLocalCollegeOptions = (): Array<{ value: CollegeCourse; label: string }> =>
        Object.entries(COLLEGE_COURSE_LABELS).map(([value, label]) => ({ value: value as CollegeCourse, label }));

    const loadOptions = async () => {
        try {
            const [contests, courses] = await Promise.all([
                getContestOptions(),
                getCollegeCourseOptions()
            ]);

            const contestData = Array.isArray(contests) ? contests : (contests as any)?.data || [];
            const collegeData = Array.isArray(courses) ? courses : (courses as any)?.data || [];

            setContestOptions(contestData.length > 0 ? contestData : getLocalContestOptions());
            setCollegeOptions(collegeData.length > 0 ? collegeData : getLocalCollegeOptions());
        } catch (error) {
            console.error('Erro ao carregar opções da API, usando labels locais:', error);
            setContestOptions(getLocalContestOptions());
            setCollegeOptions(getLocalCollegeOptions());
        }
    };

    const handleSubmit = async () => {
        if (needsUserFocus && !userFocus) {
            toast.error('Selecione um foco de estudo');
            return;
        }

        if (needsUserFocus && userFocus === 'CONCURSO' && !contestType) {
            toast.error('Selecione o tipo de concurso');
            return;
        }

        if (needsUserFocus && userFocus === 'FACULDADE' && !collegeCourse) {
            toast.error('Selecione o curso de faculdade');
            return;
        }

        if (needsEducationLevel && !educationLevel) {
            toast.error('Selecione o nível de educação');
            return;
        }

        setIsLoading(true);

        try {
            const updateData: any = {};

            if (needsUserFocus && userFocus) {
                updateData.userFocus = userFocus;
            }

            if (userFocus === 'CONCURSO' && contestType) {
                updateData.contestType = contestType;
            }

            if (userFocus === 'FACULDADE' && collegeCourse) {
                updateData.collegeCourse = collegeCourse;
            }

            if (needsEducationLevel && educationLevel) {
                updateData.educationLevel = educationLevel;
            }

            await updateProfile(updateData);

            // Buscar o perfil atualizado (fonte de verdade) e sincronizar auth + notificações
            const refreshed = await getProfile();
            updateUser(refreshed);

            if (typeof window !== 'undefined' && refreshed?.notification) {
                window.dispatchEvent(
                    new CustomEvent('profile-notifications-updated', { detail: refreshed.notification })
                );
            }

            // Invalidar cache do perfil após atualização
            await profile();

            // Obter label amigável para o badge
            const getBadgeLabel = () => {
                if (userFocus === 'ENEM') return 'ENEM';
                if (userFocus === 'ENSINO_MEDIO') return 'Ensino Médio';
                if (userFocus === 'CONCURSO' && contestType) return CONTEST_TYPE_LABELS[contestType];
                if (userFocus === 'FACULDADE' && collegeCourse) return COLLEGE_COURSE_LABELS[collegeCourse];
                return USER_FOCUS_LABELS[userFocus as UserFocus];
            };

            toast.success(`Perfil completado! Badge "${getBadgeLabel()}" atribuído.`);
            onClose();

            // Redirecionar para o perfil (e completar a etapa de campo pendente na UI)
            router.push('/profile');
        } catch (error) {
            toast.error('Erro ao atualizar perfil');
        } finally {
            setIsLoading(false);
        }
    };

    const getBadgePreview = () => {
        if (userFocus === 'ENEM') return 'ENEM';
        if (userFocus === 'ENSINO_MEDIO') return 'Ensino Médio';
        if (userFocus === 'CONCURSO' && contestType) return CONTEST_TYPE_LABELS[contestType];
        if (userFocus === 'FACULDADE' && collegeCourse) return COLLEGE_COURSE_LABELS[collegeCourse];
        return null;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white/10 backdrop-blur-xl border border-white/30 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#bd18b4] flex items-center gap-2">
                        <Award className="w-6 h-6" />
                        Complete seu Perfil
                    </DialogTitle>
                    <DialogDescription className="text-white/80">
                        {notificationData.message}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {notificationData.missingFields.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-white/60 mb-2">Campos pendentes:</h3>
                            <div className="flex flex-wrap gap-2">
                                {notificationData.missingFields.map((field, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                    >
                                        {field}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {needsEducationLevel && (
                            <div>
                                <label className="text-sm font-medium text-white mb-2 block">
                                    Nível de Educação *
                                </label>
                                <Select value={educationLevel} onValueChange={(value) => setEducationLevel(value as ApiEducationLevel)}>
                                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                                        <SelectValue placeholder="Selecione seu nível de educação" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-white/30">
                                        {Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                                className="text-white hover:bg-white/20"
                                            >
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {needsUserFocus && (
                        <div>
                            <label className="text-sm font-medium text-white mb-2 block">
                                Foco de Estudo *
                            </label>
                            <Select value={userFocus} onValueChange={(value) => setUserFocus(value as UserFocus)}>
                                <SelectTrigger className="bg-white/10 border-white/30 text-white">
                                    <SelectValue placeholder="Selecione seu foco de estudo" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-white/30">
                                    {Object.entries(USER_FOCUS_LABELS).map(([value, label]) => (
                                        <SelectItem
                                            key={value}
                                            value={value}
                                            className="text-white hover:bg-white/20"
                                        >
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        )}

                        {userFocus === 'CONCURSO' && (
                            <div>
                                <label className="text-sm font-medium text-white mb-2 block">
                                    Tipo de Concurso *
                                </label>
                                <Select value={contestType} onValueChange={(value) => setContestType(value as ContestType)}>
                                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                                        <SelectValue placeholder="Selecione o tipo de concurso" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-white/30">
                                        {contestOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="text-white hover:bg-white/20"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {userFocus === 'FACULDADE' && (
                            <div>
                                <label className="text-sm font-medium text-white mb-2 block">
                                    Curso de Faculdade *
                                </label>
                                <Select value={collegeCourse} onValueChange={(value) => setCollegeCourse(value as CollegeCourse)}>
                                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                                        <SelectValue placeholder="Selecione o curso" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-white/30">
                                        {collegeOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="text-white hover:bg-white/20"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {getBadgePreview() && (
                            <div className="bg-[#bd18b4]/10 border border-[#bd18b4]/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-[#bd18b4]">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">Badge que será atribuído:</span>
                                </div>
                                <Badge className="mt-2 bg-[#bd18b4] text-black">
                                    {getBadgePreview()}
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || (needsUserFocus && !userFocus) || (needsEducationLevel && !educationLevel)}
                            className="flex-1 bg-[#bd18b4] hover:bg-[#bd18b4]/90 text-black"
                        >
                            {isLoading ? 'Salvando...' : 'Completar Perfil'}
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
