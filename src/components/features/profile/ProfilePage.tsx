'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProfile } from '@/hooks/features/profile';
import { useAuth } from '@/hooks/features/auth';
import { getUserProfile } from '@/api/auth/get-user-profile';
import { getEmailValue } from '@/lib/utils/email';
import { LoadingGrid } from '@/components/ui/loading-grid';
import { BackgroundGrid } from '@/components/shared/BackgroundGrid';
import { Navbar } from '@/components/layout';
import { Sidebar } from '@/components/Sidebar';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    rectIntersection,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UserProfile } from '@/types/auth-api';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { RichTextEditor } from '../../shared/RichTextEditor';
import { HabilitiesModal } from './modals/HabilitiesModal';
import { FriendRequestButton } from './FriendRequestButton';
import { MessageCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../ui/select';
import {
    Edit3,
    Plus,
    Rocket,
    CheckCircle2,
    Circle,
    Globe,
    Linkedin,
    Instagram,
    Twitter,
    Github,
    GripVertical,
    ArrowLeft,
    Camera,
    Trash2,
    Eye,
    AlertCircle
} from 'lucide-react';
import { countries } from '@/lib/constants/countries';
import { COLLEGE_COURSE_LABELS, CONTEST_TYPE_LABELS, EDUCATION_LEVEL_LABELS } from '@/types/auth-api';
import { LocationModal } from '@/components/shared/LocationModal';
import ShinyText from '@/components/shared/ShinyText';
import DotGrid from '@/components/shared/DotGrid';
import { OffensivesCard } from '../offensives/OffensivesCard';
import { HabilitiesCard } from './HabilitiesCard';
import { CareerMomentCard } from './CareerMomentCard';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import toast from 'react-hot-toast';

function SortableLinkItem({
    id,
    field,
    label,
    icon: Icon,
    value,
    placeholder,
    onChange
}: {
    id: string;
    field: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    value: string;
    placeholder: string;
    onChange: (field: string, value: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="space-y-2">
            <div className="flex items-center space-x-2">
                <div className="w-6"></div>
                <label className="text-sm text-gray-300">
                    {label}
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded"
                >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
                <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                        type="url"
                        value={value}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-text pl-12 h-12"
                        placeholder={placeholder}
                    />
                </div>
            </div>
        </div>
    );
}

export function ProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        document.body.classList.add('font-metropolis');
        return () => document.body.classList.remove('font-metropolis');
    }, []);
    const userId = searchParams.get('userId');
    const { user: currentUser } = useAuth();
    const { socket } = useNotificationsContext();
    const [isDark, setIsDark] = useState(true);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    // Estado local para os valores dos inputs do modal
    const [modalValues, setModalValues] = useState({
        nome: '',
        email: ''
    });
    const [selectedEducationLevel, setSelectedEducationLevel] = useState<string>('');

    // Estado para o modal de localização
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    // Estado para visualização pública do perfil
    // Inicializar como false para evitar diferenças de hidratação
    const [isPublicView, setIsPublicView] = useState(false);

    // Estado para perfil de outro usuário
    const [otherUserProfile, setOtherUserProfile] = useState<UserProfile | null>(null);
    const [isLoadingOtherProfile, setIsLoadingOtherProfile] = useState(false);

    // Atualizar isPublicView quando userId mudar (após hidratação)
    useEffect(() => {
        setIsPublicView(!!userId);
    }, [userId]);

    // Função para salvar localização
    const handleLocationSave = async (location: string, visibility?: 'PUBLIC' | 'STATE_ONLY' | 'PRIVATE') => {
        try {
            // Usar o endpoint específico para atualizar localização
            await updateUserLocation(location, visibility);
            // Atualizar também o estado local para exibição
            handleBasicInfoChange('cidade', location);
        } catch (error) {
            // Ainda assim atualizar o estado local para exibição
            handleBasicInfoChange('cidade', location);
        }
    };

    // Função para mapear valores do foco para labels amigáveis
    const getFocusLabel = (focus: string, course?: string) => {
        const focusLabels: { [key: string]: string } = {
            'ENEM': 'ENEM',
            'CONCURSO': 'Concurso Público',
            'FACULDADE': 'Faculdade',
            'ENSINO_MEDIO': 'Ensino Médio'
        };

        // Se for faculdade e tiver curso selecionado, mostrar apenas o curso
        if (focus === 'FACULDADE' && course) {
            const courseLabel = COLLEGE_COURSE_LABELS[course as keyof typeof COLLEGE_COURSE_LABELS];
            if (courseLabel) {
                return courseLabel;
            }
        }

        // Para outros casos, usar o label padrão
        return focusLabels[focus] || focus;
    };

    // Função para formatar a data de criação do usuário
    const formatUserJoinDate = (createdAt?: string) => {
        if (!createdAt) return 'No Prisma desde 30/03/2020';

        try {
            const date = new Date(createdAt);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();

            return `No Prisma desde ${day}/${month}/${year}`;
        } catch (error) {
            return 'No Prisma desde 30/03/2020';
        }
    };

    // Determinar se está vendo o próprio perfil usando dados do useAuth
    const isOwnProfile = useMemo(() => {
        if (!userId) return true;
        return !!(currentUser?.id && userId === currentUser.id);
    }, [userId, currentUser?.id]);

    const {
        userProfile,
        isLoading,
        error,
        avatarImage,
        isUploadingImage,
        isModalOpen,
        isBasicInfoModalOpen,
        isFocusModalOpen,
        isLinksModalOpen,
        isAboutModalOpen,
        isHabilitiesModalOpen,
        isCareerModalOpen,
        selectedTask,
        formData,
        basicInfoData,
        selectedFocus,
        selectedCourse,
        selectedContest,
        linksData,
        linkFieldsOrder,
        aboutText,
        profileTasks,
        completedTasks,
        totalTasks,
        completionPercentage,
        loadUserProfile,
        getInitials,
        handleAvatarUpload,
        deleteUserProfileImage,
        handleTaskClick,
        handleModalClose,
        handleFormSubmit,
        handleInputChange,
        handleBasicInfoChange,
        handleBasicInfoSubmit,
        handleBasicInfoModalClose,
        handleFocusModalClose,
        handleFocusSelect,
        handleFocusSubmit,
        handleLinksChange,
        handleLinksSubmit,
        handleLinksModalClose,
        handleAboutModalClose,
        handleAboutSubmit,
        handleHabilitiesModalClose,
        handleHabilitiesSubmit,
        getModalFields,
        updateUserAbout,
        updateUserMomentCareer,
        updateUserLocation,
        updateUserProfile,
        setIsModalOpen,
        setSelectedTask,
        setSelectedCourse,
        setSelectedContest,
        setIsBasicInfoModalOpen,
        setIsFocusModalOpen,
        setIsLinksModalOpen,
        setIsAboutModalOpen,
        setIsHabilitiesModalOpen,
        setIsCareerModalOpen,
        setAboutText,
        setLinkFieldsOrder,
        clearError
    } = useProfile({ skipFetch: !isOwnProfile });

    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

    const handleErrorModalClose = () => {
        setIsErrorModalOpen(false);
        clearError();
    };

    // Função para carregar perfil de outro usuário
    const loadOtherUserProfile = async () => {
        if (!userId) return;

        try {
            setIsLoadingOtherProfile(true);
            const response = await getUserProfile(userId);
            if (response.success && response.data) {
                setOtherUserProfile(response.data);
            }
        } catch (error) {
            setOtherUserProfile(null);
        } finally {
            setIsLoadingOtherProfile(false);
        }
    };

    // Carregar perfil de outro usuário se userId estiver presente
    useEffect(() => {
        if (userId) {
            loadOtherUserProfile();
        } else {
            setOtherUserProfile(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Escutar eventos do Socket.IO para atualizar perfil em tempo real - IGUAL AO PEDIDO DE AMIZADE
    useEffect(() => {
        if (!socket) return;

        const currentUserId = userProfile?.id;

        // Escutar quando amizade for removida - igual ao friend_request
        const handleFriendRemoved = (data: { userId: string; friendId: string; friendName: string; removedAt: string }) => {
            // Verificar se o evento é relacionado ao usuário logado OU ao perfil sendo visualizado
            const isRelatedToLoggedUser = currentUserId && (data.userId === currentUserId || data.friendId === currentUserId);
            const isRelatedToViewedProfile = userId && (data.userId === userId || data.friendId === userId);

            // Só atualizar se estiver visualizando o perfil do outro usuário envolvido na amizade
            if (isRelatedToViewedProfile && userId && !isOwnProfile) {

                // Mostrar notificação apenas se estiver visualizando o perfil do outro usuário
                toast.success('Amizade desfeita', {
                    duration: 3000,
                    icon: '👋',
                });

                loadOtherUserProfile();
            } else if (isRelatedToLoggedUser && isOwnProfile) {
                // Se for o próprio perfil e o evento for relacionado, recarregar mas não mostrar notificação
                loadUserProfile();
            } else {
            }
        };

        // Escutar quando amizade for aceita
        const handleFriendAccepted = (data: any) => {

            // Verificar se o evento é relacionado ao usuário logado OU ao perfil sendo visualizado
            const relatedUserId = data.relatedUserId || data.requester?.id || data.receiver?.id;
            const isRelatedToLoggedUser = currentUserId && (data.requester?.id === currentUserId || data.receiver?.id === currentUserId || relatedUserId === currentUserId);
            const isRelatedToViewedProfile = userId && relatedUserId === userId;

            if (isRelatedToLoggedUser || isRelatedToViewedProfile) {
                // Se estiver visualizando um perfil de outro usuário, recarregar
                if (userId && !isOwnProfile) {
                    loadOtherUserProfile();
                }
                // Se for o próprio perfil, recarregar também
                if (isOwnProfile) {
                    loadUserProfile();
                }
            }
        };

        socket.on('friend_removed', handleFriendRemoved);
        socket.on('friend_accepted', handleFriendAccepted);

        return () => {
            socket.off('friend_removed', handleFriendRemoved);
            socket.off('friend_accepted', handleFriendAccepted);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, userId, userProfile?.id, isOwnProfile]);

    // Atualizar valores do modal quando os dados forem carregados
    useEffect(() => {
        if (userProfile && basicInfoData) {
            setModalValues({
                nome: basicInfoData.nome || userProfile.name || '',
                email: getEmailValue(userProfile)
            });
            setSelectedEducationLevel(userProfile.educationLevel || '');
        }
    }, [userProfile, basicInfoData]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // TODOS OS HOOKS DEVEM SER CHAMADOS ANTES DE QUALQUER EARLY RETURN
    // Usar dados do hook useProfile - sem dados mockados
    // Se estiver visualizando perfil de outro usuário, usar otherUserProfile
    // Usar useMemo para garantir que o user seja atualizado quando userProfile mudar
    const user = useMemo(() => {
        // Se estamos visualizando outro perfil, usar otherUserProfile
        if (userId && !isOwnProfile) {
            return otherUserProfile;
        }
        // Caso contrário, usar o perfil do usuário logado (isOwnProfile === true)
        return userProfile;
    }, [userId, isOwnProfile, otherUserProfile, userProfile]);

    // Monitorar erros e abrir modal se necessário
    useEffect(() => {
        if (error && user) {
            setIsErrorModalOpen(true);
        }
    }, [error, user]);

    // Criar uma chave baseada na ordem dos links para forçar re-render quando a ordem mudar
    // Usar useState para evitar problemas de hidratação
    // Não usar user aqui porque ainda não está definido - usar userProfile ou otherUserProfile diretamente
    // Inicializar com string vazia para evitar diferenças entre servidor e cliente
    const [linksOrderKey, setLinksOrderKey] = useState('');

    // Atualizar a chave quando a ordem mudar (apenas no cliente)
    useEffect(() => {
        const profile = userId && otherUserProfile ? otherUserProfile : userProfile;
        const newKey = JSON.stringify(profile?.socialLinksOrder || []);
        if (newKey !== linksOrderKey) {
            setLinksOrderKey(newKey);
        }
    }, [userProfile?.socialLinksOrder, otherUserProfile?.socialLinksOrder, userId, linksOrderKey]);

    // Mostrar loading se os dados estão sendo carregados
    if (isLoading || (userId && isLoadingOtherProfile)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
                <LoadingGrid size="60" color="#bd18b4" />
            </div>
        );
    }

    // Mostrar erro se houver problema ao carregar (apenas para próprio perfil e se não tiver dados de usuário)
    if (error && !userId && !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button onClick={loadUserProfile} className="bg-[#bd18b4] text-black hover:bg-[#bd18b4]/80">
                        Tentar novamente
                    </Button>
                </div>
            </div>
        );
    }

    // Se não há dados do usuário, não renderizar nada (já foi tratado no loading/error)
    if (!user) {
        return null;
    }

    // Função para renderizar os links do usuário - função normal (não hook) para evitar problemas com ordem de hooks
    const renderUserLinks = () => {
        // Ordem padrão conforme o guia
        const defaultOrder = ['linkedin', 'github', 'portfolio', 'instagram', 'twitter'];

        // Usar a ordem do backend se disponível, senão usar a ordem padrão
        const order = user?.socialLinksOrder || defaultOrder;

        const links = order.map((fieldName: string) => {
            let url = '';
            let icon = Globe;
            let label = '';

            // Mapear os campos para as URLs corretas
            switch (fieldName) {
                case 'portfolio':
                    url = user?.portfolio || '';
                    icon = Globe;
                    label = 'Portfolio';
                    break;
                case 'linkedin':
                    url = user?.linkedin || '';
                    icon = Linkedin;
                    label = 'LinkedIn';
                    break;
                case 'github':
                    url = user?.github || '';
                    icon = Github;
                    label = 'GitHub';
                    break;
                case 'instagram':
                    url = user?.instagram || '';
                    icon = Instagram;
                    label = 'Instagram';
                    break;
                case 'twitter':
                    url = user?.twitter || '';
                    icon = Twitter;
                    label = 'Twitter';
                    break;
                default:
                    url = '';
            }

            return {
                key: fieldName,
                url,
                icon,
                label
            };
        });

        const filledLinks = links.filter(link => link.url && link.url.trim() !== '');
        const emptySlots = 5 - filledLinks.length;

        return (
            <div className="grid grid-cols-5 gap-3" key={linksOrderKey} suppressHydrationWarning>
                {/* Links preenchidos */}
                {filledLinks.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                        <a
                            key={`${link.key}-${linksOrderKey}`}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square bg-[#29292E] border-2 border-[#323238] rounded-lg flex items-center justify-center hover:border-[#bd18b4] transition-colors cursor-pointer group"
                            title={link.label}
                        >
                            <IconComponent className="w-6 h-6 text-[#bd18b4] group-hover:scale-110 transition-transform" />
                        </a>
                    );
                })}

                {/* Slots vazios - apenas para o próprio perfil */}
                {isOwnProfile && !isPublicView && Array.from({ length: emptySlots }).map((_, index) => (
                    <div
                        key={`empty-${index}`}
                        className="aspect-square bg-transparent border-2 border-dashed border-[#323238] rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors cursor-pointer"
                        onClick={() => setIsLinksModalOpen(true)}
                    >
                        <Plus className="w-5 h-5 text-gray-600" />
                    </div>
                ))}
            </div>
        );
    };

    // profileTasks, completedTasks, totalTasks e completionPercentage já estão disponíveis no hook useProfile

    // getInitials já está disponível no hook useProfile

    // Todas as funções de manipulação já estão disponíveis no hook useProfile

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLinkFieldsOrder((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newOrder = arrayMove(items, oldIndex, newIndex);
                console.log('🔄 Drag and Drop - Nova ordem:', newOrder.map(item => item.field));
                return newOrder;
            });
        }
    };

    // handleAboutModalClose e handleAboutSubmit já estão disponíveis no hook useProfile

    const handleGoBack = () => {
        router.back();
    };

    // getModalFields já está disponível no hook useProfile

    return (
        <div className="min-h-screen text-white relative font-metropolis">
            <BackgroundGrid />


            <div className="relative z-10 flex">
                <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
                <div className="flex-1">
                    <Navbar isDark={isDark} toggleTheme={toggleTheme} />

                    <div className="relative z-10 p-4 md:p-8 pt-28 md:pt-32 min-h-screen ml-0 md:ml-10">
                        <div className="max-w-7xl mx-auto w-full relative z-10">
                            <div className="mb-6">
                                <Button
                                    onClick={handleGoBack}
                                    variant="ghost"
                                    className="text-white/60 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Voltar
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1">
                                    <div className="space-y-6">
                                        <div className="bg-glass backdrop-blur-xl border border-glass-border rounded-3xl p-8 relative overflow-hidden group/profile-card">
                                            <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent opacity-0 group-hover/profile-card:opacity-100 transition-opacity duration-500" />


                                            <div className="text-center mb-6 relative z-10">
                                                <div className="relative inline-block group/avatar mb-6 rounded-full">
                                                    <Avatar
                                                        className={`w-32 h-32 md:w-40 md:h-40 border-4 border-brand/20 shadow-2xl transition-all duration-500 ${isUploadingImage ? 'opacity-50' : isOwnProfile ? 'cursor-pointer group-hover/avatar:scale-105 group-hover/avatar:border-brand/40' : ''}`}
                                                        onClick={() => {
                                                            if (isOwnProfile && !isUploadingImage) {
                                                                document.getElementById('avatar-upload')?.click();
                                                            }
                                                        }}
                                                    >
                                                        <AvatarImage
                                                            src={user.profileImage || avatarImage || "/api/placeholder/96/96"}
                                                            className="object-cover transition-all duration-300"
                                                            alt="Foto do perfil"
                                                        />
                                                        <AvatarFallback className="text-3xl md:text-4xl font-black bg-gradient-to-br from-brand to-brand-accent text-white">
                                                            {getInitials(user)}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    {/* Overlay com ícone de câmera no hover - apenas para o próprio perfil */}
                                                    {isOwnProfile && !isUploadingImage && (
                                                        <div
                                                            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 cursor-pointer pointer-events-none group-hover/avatar:pointer-events-auto"
                                                            onClick={() => {
                                                                if (!isUploadingImage) {
                                                                    document.getElementById('avatar-upload')?.click();
                                                                }
                                                            }}
                                                        >
                                                            <Camera className="w-6 h-6 text-white" />
                                                        </div>
                                                    )}

                                                    {/* Indicador de loading durante upload */}
                                                    {isUploadingImage && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                                            <LoadingGrid size="24" color="var(--brand)" />
                                                        </div>
                                                    )}

                                                    {/* Input de upload - apenas para o próprio perfil */}
                                                    {isOwnProfile && (
                                                        <input
                                                            type="file"
                                                            accept="image/*, .svg"
                                                            onChange={handleAvatarUpload}
                                                            className="hidden"
                                                            id="avatar-upload"
                                                            disabled={isUploadingImage}
                                                        />
                                                    )}

                                                    {/* Botão de remover foto - apenas para o próprio perfil */}
                                                    {isOwnProfile && (user.profileImage || avatarImage) && !isUploadingImage && (
                                                        <div
                                                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-black/60 backdrop-blur-md border border-red-500/30 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 cursor-pointer hover:bg-black/80 hover:border-red-500/50 hover:scale-110"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteUserProfileImage();
                                                            }}
                                                            title="Remover foto"
                                                        >
                                                            <Trash2 className="w-3 h-3 text-red-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <h1 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">
                                                    {user.name}
                                                </h1>
                                                <p className="text-white/40 text-sm font-medium mb-6">
                                                    {getEmailValue(user) || 'usuario@email.com'}
                                                </p>

                                                {/* Botões de Ação */}
                                                <div className="space-y-2">
                                                    {!isOwnProfile && (
                                                        <>
                                                            <FriendRequestButton
                                                                userId={userId || ''}
                                                                isFriend={user.isFriend}
                                                            />
                                                            {user.isFriend && (
                                                                <Button
                                                                    onClick={() => {
                                                                        router.push(`/communities?chat=${userId}`);
                                                                    }}
                                                                    className="w-full bg-brand hover:bg-brand/80 text-black px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
                                                                >
                                                                    <MessageCircle className="w-4 h-4" />
                                                                    Conversar
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Botão "Ver perfil privado" - apenas para o próprio perfil */}
                                                    {isOwnProfile && (
                                                        <Button
                                                            className={`w-full px-6 py-2 rounded-lg font-bold transition-all duration-300 cursor-pointer border ${isPublicView
                                                                ? 'bg-[#bd18b4]/10 border-[#bd18b4] text-[#bd18b4] hover:text-white hover:border-white'
                                                                : 'bg-transparent border-[#323238] text-gray-400 hover:text-white hover:border-white'
                                                                }`}
                                                            onClick={() => setIsPublicView(!isPublicView)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            {isPublicView ? 'Ver perfil privado' : 'Ver como outros me veem'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6 relative z-10">
                                                {user?.location ? (
                                                    (() => {
                                                        const location = user.location;
                                                        const visibility = user.locationVisibility;

                                                        // Aplicar privacidade quando:
                                                        // - Outra pessoa está visualizando o perfil (!isOwnProfile), OU
                                                        // - O próprio usuário está em modo "ver como outros me veem" (isPublicView)
                                                        if (!isOwnProfile || isPublicView) {
                                                            if (visibility === 'PRIVATE') return null;
                                                            if (visibility === 'STATE_ONLY') {
                                                                const parts = location.split(' - ');
                                                                if (parts.length > 1) return (
                                                                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group/item hover:bg-white/10 hover:border-[#bd18b4]/30 transition-all">
                                                                        <div className="flex items-center">
                                                                            <div className="w-2 h-2 bg-[#bd18b4] shadow-[0_0_10px_#bd18b4] rounded-full mr-4 flex-shrink-0 animate-pulse"></div>
                                                                            <span className="text-white/90 text-sm font-semibold">
                                                                                {parts[parts.length - 1]}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                                const commaParts = location.split(', ');
                                                                if (commaParts.length > 1) return (
                                                                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group/item hover:bg-white/10 hover:border-[#bd18b4]/30 transition-all">
                                                                        <div className="flex items-center">
                                                                            <div className="w-2 h-2 bg-[#bd18b4] shadow-[0_0_10px_#bd18b4] rounded-full mr-4 flex-shrink-0 animate-pulse"></div>
                                                                            <span className="text-white/90 text-sm font-semibold">
                                                                                {commaParts[commaParts.length - 1]}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                        }

                                                        return (
                                                            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group/item hover:bg-white/10 hover:border-[#bd18b4]/30 transition-all">
                                                                <div className="flex items-center">
                                                                    <div className="w-2 h-2 bg-[#bd18b4] shadow-[0_0_10px_#bd18b4] rounded-full mr-4 flex-shrink-0 animate-pulse"></div>
                                                                    <span className="text-white/90 text-sm font-semibold">
                                                                        {location}
                                                                    </span>
                                                                </div>
                                                                {!isPublicView && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => setIsLocationModalOpen(true)}
                                                                        className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 h-8 w-8 hover:bg-white/10 cursor-pointer"
                                                                    >
                                                                        <Edit3 className="w-4 h-4 text-white/60" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        );
                                                    })()
                                                ) : (
                                                    !isPublicView && (
                                                        <Button
                                                            className="w-full bg-white/5 hover:bg-[#bd18b4]/10 hover:border-[#bd18b4]/30 hover:text-white text-white/50 border border-white/10 rounded-2xl justify-start text-sm py-3 px-4 cursor-pointer transition-all group/btn"
                                                            onClick={() => setIsLocationModalOpen(true)}
                                                        >
                                                            <Plus className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform" />
                                                            Adicionar Localização
                                                        </Button>
                                                    )
                                                )}
                                                {user?.userFocus ? (
                                                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group/item hover:bg-white/10 hover:border-[#bd18b4]/30 transition-all">
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 bg-[#bd18b4] shadow-[0_0_10px_#bd18b4] rounded-full mr-4 animate-pulse"></div>
                                                            <span className="text-white/90 text-sm font-semibold">
                                                                {getFocusLabel(user.userFocus, user.collegeCourse || user.contestType || undefined)}
                                                            </span>
                                                        </div>
                                                        {!isPublicView && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setIsFocusModalOpen(true)}
                                                                className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 h-8 w-8 hover:bg-white/10 cursor-pointer"
                                                            >
                                                                <Edit3 className="w-4 h-4 text-white/60" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    !isPublicView && (
                                                        <Button
                                                            className="w-full bg-white/5 hover:bg-[#bd18b4]/10 hover:border-[#bd18b4]/30 hover:text-white text-[#bd18b4]/80 border border-white/10 rounded-2xl justify-start text-sm py-3 px-4 cursor-pointer transition-all group/btn"
                                                            onClick={() => setIsFocusModalOpen(true)}
                                                        >
                                                            <Plus className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform" />
                                                            Escolher Foco de Estudo
                                                        </Button>
                                                    )
                                                )}

                                                {/* Idade */}
                                                {user?.age && (
                                                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center group hover:bg-white/10 hover:border-[#bd18b4]/30 transition-all">
                                                        <div className="w-2 h-2 bg-[#bd18b4] shadow-[0_0_10px_#bd18b4] rounded-full mr-4 flex-shrink-0 animate-pulse"></div>
                                                        <span className="text-white/90 text-sm font-semibold">
                                                            {user.age} anos
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Nível de Educação */}
                                                {user?.educationLevel && (() => {
                                                    const educationLevelMap: Record<string, keyof typeof EDUCATION_LEVEL_LABELS> = {
                                                        'POSTGRADUATE': 'POS_GRADUACAO',
                                                        'HIGH_SCHOOL': 'ENSINO_MEDIO',
                                                        'GRADUATION': 'GRADUACAO',
                                                        'ELEMENTARY': 'FUNDAMENTAL',
                                                        'MASTER': 'MESTRADO',
                                                        'DOCTORATE': 'DOUTORADO',
                                                    };

                                                    const mappedLevel = educationLevelMap[user.educationLevel] || user.educationLevel as keyof typeof EDUCATION_LEVEL_LABELS;
                                                    const label = EDUCATION_LEVEL_LABELS[mappedLevel] || user.educationLevel;

                                                    return (
                                                        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center group hover:bg-white/10 hover:border-[#bd18b4]/30 transition-all">
                                                            <div className="w-2 h-2 bg-[#bd18b4] shadow-[0_0_10px_#bd18b4] rounded-full mr-4 flex-shrink-0 animate-pulse"></div>
                                                            <span className="text-white/90 text-sm font-semibold">
                                                                {label}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Curso */}
                                                {user?.collegeCourse && (
                                                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center group hover:bg-white/10 hover:border-[#bd18b4]/30 transition-all">
                                                        <div className="w-2 h-2 bg-[#bd18b4] shadow-[0_0_10px_#bd18b4] rounded-full mr-4 flex-shrink-0 animate-pulse"></div>
                                                        <span className="text-white/90 text-sm font-semibold">
                                                            {COLLEGE_COURSE_LABELS[user.collegeCourse as keyof typeof COLLEGE_COURSE_LABELS] || user.collegeCourse}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest text-center mt-6 relative z-10">
                                                {formatUserJoinDate(user?.createdAt)}
                                            </p>
                                        </div>

                                        {/* Card de Momento de Carreira - Sempre visível */}
                                        <CareerMomentCard
                                            userProfile={user}
                                            isPublicView={isPublicView || !isOwnProfile}
                                            onEditClick={() => setIsCareerModalOpen(true)}
                                        />

                                        {/* Card de Habilidades */}
                                        <HabilitiesCard
                                            userProfile={user}
                                            isPublicView={isPublicView || !isOwnProfile}
                                            onEditClick={() => setIsHabilitiesModalOpen(true)}
                                        />

                                        {/* Links - Agora abaixo de Habilidades */}
                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                                            <div className="flex items-center justify-between mb-4 relative z-10">
                                                <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Links</h3>
                                                {isOwnProfile && !isPublicView && (
                                                    <Button
                                                        className="bg-transparent hover:bg-white/5 text-white/40 hover:text-white p-2 cursor-pointer transition-all"
                                                        size="sm"
                                                        onClick={() => setIsLinksModalOpen(true)}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="relative z-10">
                                                {renderUserLinks()}
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-6">
                                    {/* Seção "Complete seu perfil" - apenas na visualização privada */}
                                    {!isPublicView && (
                                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#bd18b4]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-black text-white tracking-tight">Complete seu perfil</h2>
                                                        <p className="text-white/40 text-sm font-medium">Perfis completos atraem mais oportunidades!</p>
                                                    </div>
                                                </div>

                                                <div className="mb-8">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-emerald-500 font-bold text-sm tracking-widest uppercase">{completionPercentage}% completo</span>
                                                        <span className="text-white/40 font-bold text-xs">{completedTasks} de {totalTasks}</span>
                                                    </div>
                                                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5 p-0.5">
                                                        <div
                                                            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                                            style={{ width: `${completionPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {profileTasks.map((task, index) => (
                                                        <div
                                                            key={index}
                                                            className={`flex items-center space-x-3 cursor-pointer p-4 rounded-2xl transition-all border ${task.completed
                                                                ? 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10'
                                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                                                }`}
                                                            onClick={() => handleTaskClick(task.label)}
                                                        >
                                                            {task.completed ? (
                                                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                                    <CheckCircle2 className="w-3 h-3 text-black" />
                                                                </div>
                                                            ) : (
                                                                <Circle className="w-5 h-5 text-white/20" />
                                                            )}
                                                            <span className={`text-sm font-semibold tracking-tight ${task.completed ? 'text-white' : 'text-white/40'}`}>
                                                                {task.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Card de Ofensivas - Agora acima do Sobre */}
                                    <OffensivesCard />

                                    {/* Sobre - Agora acima dos Links */}
                                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                                        <div className="flex justify-between items-center mb-6 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-6 bg-[#bd18b4] rounded-full" />
                                                <h3 className="text-xl font-black text-white tracking-tight uppercase">Sobre</h3>
                                            </div>
                                            {!isPublicView && (
                                                <Button
                                                    className="bg-transparent hover:bg-white/5 text-white/40 hover:text-white p-2 cursor-pointer transition-all"
                                                    size="sm"
                                                    onClick={() => setIsAboutModalOpen(true)}
                                                >
                                                    <Edit3 className="w-5 h-5" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="bg-[#202024] border border-[#323238] rounded-xl p-6 min-h-[120px]">
                                            {user?.aboutYou ? (
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: user.aboutYou || ''
                                                    }}
                                                    className="rich-text-content prose prose-invert prose-pink max-w-none text-white/70"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 opacity-20">
                                                    <Edit3 className="w-12 h-12 mb-4" />
                                                    <span className="font-bold uppercase tracking-widest text-xs">Nada por aqui ainda</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#bd18b4]/5 before:to-transparent before:pointer-events-none">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-semibold text-white">Destaques</h3>
                                            <Button
                                                className="bg-transparent hover:bg-white/5 text-gray-400 p-1 cursor-pointer"
                                                size="sm"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-[#323238] rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Rocket className="w-8 h-8 text-gray-500" />
                                            </div>
                                            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                                                Compartilhe o link dos seus melhores projetos para se destacar e conquistar oportunidades
                                            </p>
                                            <Button className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black px-6 py-2 rounded-lg font-medium flex items-center space-x-2 mx-auto cursor-pointer">
                                                <Plus className="w-4 h-4" />
                                                <span>Adicionar destaques</span>
                                            </Button>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Modals moved outside the main scrollable area for better stability */}

            {/* Modal para editar informações do perfil */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white text-lg font-semibold">
                            {selectedTask}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit}>
                        {selectedTask && getModalFields(selectedTask).map((field) => (
                            <div key={field.key} className='flex flex-col gap-2'>
                                <label className="text-sm text-gray-300">
                                    {field.label}
                                </label>
                                {field.type === 'textarea' ? (
                                    <Textarea
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        className="bg-[#29292E] cursor-text border-[#323238] text-white placeholder-gray-400 focus:border-[#bd18b4] focus:ring-[#bd18b4]"
                                        placeholder={`Digite ${field.label.toLowerCase()}...`}
                                        rows={3}
                                    />
                                ) : field.type === 'file' ? (
                                    <Input
                                        type="file"
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        className="bg-[#29292E] h-12 border-[#323238] p-2 text-white file:bg-[#bd18b4] file:text-black file:border-0 file:px-2 cursor-pointer file:mr-4 file:min-w-[120px] file:rounded-md focus:!border-[#323238] focus:!ring-0 focus:!outline-none"
                                    />
                                ) : (
                                    <Input
                                        type={field.type}
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:border-[#bd18b4] focus:ring-[#bd18b4]"
                                        placeholder={`Digite ${field.label.toLowerCase()}...`}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="flex justify-end mt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleModalClose}
                                className="border-[#323238] text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-colors"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black cursor-pointer"
                            >
                                Salvar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para editar informações básicas */}
            <Dialog open={isBasicInfoModalOpen} onOpenChange={setIsBasicInfoModalOpen} key={userProfile?.id}>
                <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white text-lg font-semibold">
                            Editar informações básicas
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={async (e) => {
                        await handleBasicInfoSubmit(e);
                        if (selectedEducationLevel && selectedEducationLevel !== userProfile?.educationLevel) {
                            await updateUserProfile({ educationLevel: selectedEducationLevel });
                        }
                    }} className="space-y-4">
                        {/* Nome */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                                Nome
                            </label>
                            <Input
                                type="text"
                                value={modalValues.nome}
                                className="bg-[#1a1a1a] border-[#323238] text-gray-400 cursor-not-allowed"
                                placeholder="Nome não pode ser alterado"
                                readOnly
                                disabled
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2 relative group">
                            <label className="text-sm text-gray-300 flex items-center justify-between">
                                E-mail
                                <span className="text-xs text-gray-500 font-normal">(Não editável)</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type="email"
                                    value={modalValues.email}
                                    className="bg-[#151515] border-[#2a2a2e] text-gray-500 cursor-not-allowed opacity-70 pr-8"
                                    placeholder="E-mail não pode ser alterado"
                                    readOnly
                                    disabled
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 left-0">
                                Para alterar seu e-mail, entre em contato com o suporte.
                            </p>
                        </div>

                        {/* Área de atuação */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                                Área de atuação
                            </label>
                            <Input
                                type="text"
                                value={basicInfoData.areaAtuacao}
                                onChange={(e) => handleBasicInfoChange('areaAtuacao', e.target.value)}
                                className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-text"
                                placeholder="Em uma frase, o que você faz?"
                            />
                        </div>

                        {/* Empresa */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                                Empresa
                            </label>
                            <Input
                                type="text"
                                value={basicInfoData.empresa}
                                onChange={(e) => handleBasicInfoChange('empresa', e.target.value)}
                                className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-text"
                                placeholder="Você trabalha atualmente em alguma empresa?"
                            />
                        </div>

                        {/* Nacionalidade */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                                Nacionalidade
                            </label>
                            <Select
                                value={basicInfoData.nacionalidade}
                                onValueChange={(value) => handleBasicInfoChange('nacionalidade', value)}
                            >
                                <SelectTrigger className="bg-[#29292E] border-[#323238] text-white focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer">
                                    <SelectValue placeholder="Em que país você nasceu?" />
                                </SelectTrigger>
                                <SelectContent
                                    className="bg-[#29292E] border-[#323238] text-white max-h-60 z-50 !animate-none !transition-none"
                                    position="popper"
                                    sideOffset={4}
                                    align="start"
                                    style={{
                                        animation: 'none',
                                        transition: 'none'
                                    }}
                                >
                                    {countries.map((country) => (
                                        <SelectItem
                                            key={country.code}
                                            value={country.name}
                                            className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                                        >
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Nível de Educação */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                                Nível de Educação
                            </label>
                            <Select
                                value={selectedEducationLevel}
                                onValueChange={setSelectedEducationLevel}
                            >
                                <SelectTrigger className="bg-[#29292E] border-[#323238] text-white focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer">
                                    <SelectValue placeholder="Selecione seu nível de educação" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#29292E] border-[#323238] text-white z-50">
                                    {Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => (
                                        <SelectItem
                                            key={value}
                                            value={value}
                                            className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                                        >
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBasicInfoModalClose}
                                className="border-[#323238] text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-colors"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black cursor-pointer"
                            >
                                Salvar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para escolher foco */}
            <Dialog open={isFocusModalOpen} onOpenChange={setIsFocusModalOpen}>
                <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white text-lg font-semibold">
                            Escolha seu foco
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Seleção do foco principal */}
                        <div className="space-y-3">
                            <h3 className="text-sm text-gray-300">Qual é o seu foco principal?</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant={selectedFocus === 'ENEM' ? 'default' : 'outline'}
                                    onClick={() => handleFocusSelect('ENEM')}
                                    className={`h-12 text-sm cursor-pointer transition-colors ${selectedFocus === 'ENEM'
                                        ? 'bg-[#bd18b4] text-black hover:bg-[#aa22c5]'
                                        : 'border-[#323238] text-gray-300 hover:bg-[#bd18b4]/10 hover:border-[#bd18b4]/30 hover:text-[#c532e2]'
                                        }`}
                                >
                                    ENEM
                                </Button>
                                <Button
                                    variant={selectedFocus === 'CONCURSO' ? 'default' : 'outline'}
                                    onClick={() => handleFocusSelect('CONCURSO')}
                                    className={`h-12 text-sm cursor-pointer transition-colors ${selectedFocus === 'CONCURSO'
                                        ? 'bg-[#bd18b4] text-black hover:bg-[#aa22c5]'
                                        : 'border-[#323238] text-gray-300 hover:bg-[#bd18b4]/10 hover:border-[#bd18b4]/30 hover:text-[#c532e2]'
                                        }`}
                                >
                                    Concurso
                                </Button>
                                <Button
                                    variant={selectedFocus === 'FACULDADE' ? 'default' : 'outline'}
                                    onClick={() => handleFocusSelect('FACULDADE')}
                                    className={`h-12 text-sm cursor-pointer transition-colors ${selectedFocus === 'FACULDADE'
                                        ? 'bg-[#bd18b4] text-black hover:bg-[#aa22c5]'
                                        : 'border-[#323238] text-gray-300 hover:bg-[#bd18b4]/10 hover:border-[#bd18b4]/30 hover:text-[#c532e2]'
                                        }`}
                                >
                                    Faculdade
                                </Button>
                                <Button
                                    variant={selectedFocus === 'ENSINO_MEDIO' ? 'default' : 'outline'}
                                    onClick={() => handleFocusSelect('ENSINO_MEDIO')}
                                    className={`h-12 text-sm cursor-pointer transition-colors ${selectedFocus === 'ENSINO_MEDIO'
                                        ? 'bg-[#bd18b4] text-black hover:bg-[#aa22c5]'
                                        : 'border-[#323238] text-gray-300 hover:bg-[#bd18b4]/10 hover:border-[#bd18b4]/30 hover:text-[#c532e2]'
                                        }`}
                                >
                                    Ensino Médio
                                </Button>
                            </div>
                        </div>

                        {/* Seleção de curso (se faculdade) */}
                        {selectedFocus === 'FACULDADE' && (
                            <div className="space-y-3">
                                <h3 className="text-sm text-gray-300">Qual curso você pretende fazer?</h3>
                                <Select
                                    value={selectedCourse}
                                    onValueChange={setSelectedCourse}
                                >
                                    <SelectTrigger className="bg-[#29292E] border-[#323238] text-white focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer">
                                        <SelectValue placeholder="Selecione um curso" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className="bg-[#29292E] border-[#323238] text-white max-h-60 z-50 !animate-none !transition-none"
                                        position="popper"
                                        sideOffset={4}
                                        align="start"
                                        style={{
                                            animation: 'none',
                                            transition: 'none'
                                        }}
                                    >
                                        {Object.entries(COLLEGE_COURSE_LABELS).map(([key, label]) => (
                                            <SelectItem
                                                key={key}
                                                value={key}
                                                className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                                            >
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Seleção de concurso (se concurso) */}
                        {selectedFocus === 'CONCURSO' && (
                            <div className="space-y-3">
                                <h3 className="text-sm text-gray-300">Qual concurso você pretende fazer?</h3>
                                <Select
                                    value={selectedContest}
                                    onValueChange={setSelectedContest}
                                >
                                    <SelectTrigger className="bg-[#29292E] border-[#323238] text-white focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer">
                                        <SelectValue placeholder="Selecione um concurso" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className="bg-[#29292E] border-[#323238] text-white max-h-60 z-50 !animate-none !transition-none"
                                        position="popper"
                                        sideOffset={4}
                                        align="start"
                                        style={{
                                            animation: 'none',
                                            transition: 'none'
                                        }}
                                    >
                                        {Object.entries(CONTEST_TYPE_LABELS).map(([key, label]) => (
                                            <SelectItem
                                                key={key}
                                                value={key}
                                                className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                                            >
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleFocusModalClose}
                                className="border-[#323238] text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-colors"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                onClick={handleFocusSubmit}
                                className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black cursor-pointer"
                                disabled={!selectedFocus || (selectedFocus === 'FACULDADE' && !selectedCourse) || (selectedFocus === 'CONCURSO' && !selectedContest)}
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal para editar links */}
            <Dialog open={isLinksModalOpen} onOpenChange={setIsLinksModalOpen}>
                <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white text-lg font-semibold">
                            Editar links
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleLinksSubmit} className="space-y-6">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={rectIntersection}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={linkFieldsOrder.map(item => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {linkFieldsOrder.map((item) => (
                                    <SortableLinkItem
                                        key={item.id}
                                        id={item.id}
                                        field={item.field}
                                        label={item.label}
                                        icon={item.icon}
                                        value={linksData[item.field as keyof typeof linksData]}
                                        placeholder={item.placeholder}
                                        onChange={handleLinksChange}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleLinksModalClose}
                                className="border-[#323238] text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-colors"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black cursor-pointer transition-colors"
                            >
                                Salvar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para editar sobre */}
            <Dialog open={isAboutModalOpen} onOpenChange={setIsAboutModalOpen}>
                <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-white text-lg font-semibold">
                            Editar sobre
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <RichTextEditor
                            content={aboutText}
                            onChange={setAboutText}
                            placeholder="Conte um pouco sobre você..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAboutModalClose}
                            className="border-[#323238] text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-colors"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAboutSubmit}
                            className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black cursor-pointer transition-colors"
                        >
                            Salvar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal para editar habilidades */}
            <HabilitiesModal
                isOpen={isHabilitiesModalOpen}
                onClose={handleHabilitiesModalClose}
                currentHabilities={userProfile?.habilities ? userProfile.habilities.split(',').map(h => h.trim()).filter(h => h) : []}
                onSave={handleHabilitiesSubmit}
            />

            {/* Modal para editar localização */}
            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onSave={handleLocationSave}
                currentLocation={basicInfoData.cidade}
                currentVisibility={userProfile?.locationVisibility}
            />

            {/* Modal para editar momento de carreira */}
            <Dialog open={isCareerModalOpen} onOpenChange={setIsCareerModalOpen}>
                <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white text-lg font-semibold">
                            Editar momento de carreira
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const momentCareer = formData.get('momentCareer') as string;

                        try {
                            await updateUserMomentCareer(momentCareer?.trim() || null);
                            setIsCareerModalOpen(false);
                        } catch (error: any) {
                            if (error?.message?.includes('500 caracteres')) {
                                alert('❌ O momento de carreira deve ter no máximo 500 caracteres');
                            } else if (error?.status === 400) {
                                alert('❌ Erro ao atualizar momento de carreira. Verifique se o texto não é muito longo.');
                            } else {
                                alert('❌ Erro ao atualizar momento de carreira. Tente novamente.');
                            }
                        }
                    }} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                                Momento de carreira
                            </label>
                            <Textarea
                                name="momentCareer"
                                maxLength={500}
                                defaultValue={userProfile?.momentCareer || ''}
                                className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-text min-h-[120px] resize-none"
                                placeholder="Ex: Desenvolvedor Júnior, Responsável pelo desenvolvimento e manutenção de todo o ecossistema..."
                            />
                            <p className="text-xs text-gray-400">
                                Máximo 500 caracteres
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCareerModalOpen(false)}
                                className="border-[#323238] text-gray-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-colors"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#bd18b4] hover:bg-[#aa22c5] text-black cursor-pointer"
                            >
                                Salvar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Modal de Erro */}
            <Dialog open={isErrorModalOpen} onOpenChange={handleErrorModalClose}>
                <DialogContent className="bg-[#121214] border-[#323238] text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-400">
                            <span className="p-2 bg-red-400/10 rounded-full">
                                <AlertCircle className="w-5 h-5" />
                            </span>
                            Erro
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-300">{error}</p>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={handleErrorModalClose}
                            className="bg-zinc-700 hover:bg-zinc-600 text-white"
                        >
                            Fechar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
