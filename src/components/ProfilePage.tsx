'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/features/useProfile';
import { getEmailValue } from '@/lib/utils/email';
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
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RichTextEditor } from './RichTextEditor';
import { HabilitiesModal } from './features/profile/modals/HabilitiesModal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
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
    Trash2
} from 'lucide-react';
import { countries } from '@/lib/constants/countries';
import { COLLEGE_COURSE_LABELS, CONTEST_TYPE_LABELS } from '@/types/auth-api';
import { LocationModal } from '@/components/LocationModal';
import ShinyText from './ShinyText';
import DotGrid from './DotGrid';

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
                        className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer pl-12 h-12"
                        placeholder={placeholder}
                    />
                </div>
            </div>
        </div>
    );
}

export function ProfilePage() {
    const router = useRouter();
    
    // Estado local para os valores dos inputs do modal
    const [modalValues, setModalValues] = useState({
        nome: '',
        email: ''
    });

    // Estado para o modal de localização
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    // Função para salvar localização
    const handleLocationSave = async (location: string) => {
        try {
            // Usar o endpoint específico para atualizar localização
            await updateUserLocation(location);
            // Atualizar também o estado local para exibição
            handleBasicInfoChange('cidade', location);
        } catch (error) {
            console.error('Erro ao salvar localização:', error);
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
            console.error('Erro ao formatar data:', error);
            return 'No Prisma desde 30/03/2020';
        }
    };

    // Função para renderizar os links do usuário
    const renderUserLinks = () => {
        // Usar a ordem definida no linkFieldsOrder
        const links = linkFieldsOrder.map(field => {
            let url = '';
            let icon = field.icon;
            
            // Mapear os campos para as URLs corretas
            switch (field.field) {
                case 'sitePessoal':
                    url = userProfile?.portfolio || '';
                    break;
                case 'linkedin':
                    url = userProfile?.linkedin || '';
                    break;
                case 'github':
                    url = userProfile?.github || '';
                    break;
                case 'instagram':
                    url = userProfile?.instagram || '';
                    break;
                case 'twitter':
                    url = userProfile?.twitter || '';
                    break;
                default:
                    url = '';
            }
            
            return {
                key: field.field,
                url,
                icon,
                label: field.label
            };
        });

        const filledLinks = links.filter(link => link.url && link.url.trim() !== '');
        const emptySlots = 5 - filledLinks.length;

        return (
            <div className="grid grid-cols-5 gap-3">
                {/* Links preenchidos */}
                {filledLinks.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                        <div
                            key={link.key}
                            className="aspect-square bg-[#29292E] border-2 border-[#323238] rounded-lg flex items-center justify-center hover:border-[#B3E240] transition-colors cursor-pointer group"
                            onClick={() => setIsLinksModalOpen(true)}
                            title={link.label}
                        >
                            <IconComponent className="w-6 h-6 text-[#B3E240] group-hover:scale-110 transition-transform" />
                        </div>
                    );
                })}
                
                {/* Slots vazios */}
                {Array.from({ length: emptySlots }).map((_, index) => (
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
        updateUserLocation,
        setIsModalOpen,
        setSelectedTask,
        setSelectedCourse,
        setSelectedContest,
        setIsBasicInfoModalOpen,
        setIsFocusModalOpen,
        setIsLinksModalOpen,
        setIsAboutModalOpen,
        setIsHabilitiesModalOpen,
        setAboutText,
        setLinkFieldsOrder
    } = useProfile();

    // Atualizar valores do modal quando os dados forem carregados
    useEffect(() => {
        if (userProfile && basicInfoData) {
            setModalValues({
                nome: basicInfoData.nome || userProfile.name || '',
                email: getEmailValue(userProfile)
            });
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

    // Mostrar loading se os dados estão sendo carregados
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B3E240] mx-auto mb-4"></div>
                    <p className="text-white/60">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    // Mostrar erro se houver problema ao carregar
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button onClick={loadUserProfile} className="bg-[#B3E240] text-black hover:bg-[#B3E240]/80">
                        Tentar novamente
                    </Button>
                </div>
            </div>
        );
    }

    // Usar dados do hook useProfile - sem dados mockados
    const user = userProfile;

    // Se não há dados do usuário, não renderizar nada (já foi tratado no loading/error)
    if (!user) {
        return null;
    }

    // profileTasks, completedTasks, totalTasks e completionPercentage já estão disponíveis no hook useProfile

    // getInitials já está disponível no hook useProfile

    // Todas as funções de manipulação já estão disponíveis no hook useProfile

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLinkFieldsOrder((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // handleAboutModalClose e handleAboutSubmit já estão disponíveis no hook useProfile

    const handleGoBack = () => {
        router.back();
    };

    // getModalFields já está disponível no hook useProfile

    return (
        <div className="min-h-screen bg-[#09090A] text-white relative">
            {/* DotGrid Background */}
            <div className="fixed inset-0 z-0">
                <DotGrid
                    dotSize={1}
                    gap={24}
                    baseColor="rgba(255,255,255,0.25)"
                    activeColor="#B3E240"
                    proximity={120}
                    shockRadius={250}
                    shockStrength={5}
                    resistance={750}
                    returnDuration={1.5}
                />
            </div>


            <div className="fixed top-4 left-4 z-50 mt-4 ml-4">
                <Button
                    onClick={handleGoBack}
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
            </div>

            <div className="relative z-10 p-6 min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto w-full relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">


                                    <div className="text-center mb-6">
                                        <div className="relative inline-block group mb-4">
                                            <Avatar
                                                className={`w-24 h-24 cursor-pointer transition-all duration-300 ${isUploadingImage ? 'opacity-50' : 'hover:scale-105'}`}
                                                onClick={() => {
                                                    if (!isUploadingImage) {
                                                        console.log('🖱️ Clicando no avatar para abrir seletor de arquivos');
                                                        document.getElementById('avatar-upload')?.click();
                                                    }
                                                }}
                                            >
                                                <AvatarImage 
                                                    src={user.profileImage || avatarImage || "/api/placeholder/96/96"} 
                                                    className="object-cover transition-all duration-300" 
                                                    alt="Foto do perfil"
                                                />
                                                <AvatarFallback className="text-xl font-bold bg-[#B3E240] text-black">
                                                    {getInitials(user)}
                                                </AvatarFallback>
                                            </Avatar>
                                            
                                            {/* Overlay com ícone de câmera no hover */}
                                            {!isUploadingImage && (
                                                <div 
                                                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer pointer-events-none group-hover:pointer-events-auto"
                                                    onClick={() => {
                                                        if (!isUploadingImage) {
                                                            console.log('🖱️ Clicando no overlay da câmera para abrir seletor de arquivos');
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
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#B3E240]"></div>
                                                </div>
                                            )}
                                            
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                id="avatar-upload"
                                                disabled={isUploadingImage}
                                            />
                                            
                                            {/* Botão de remover foto - bolinha pequena no canto inferior direito */}
                                            {(user.profileImage || avatarImage) && !isUploadingImage && (
                                                <div 
                                                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-black/80 border border-red-500/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:bg-black/90 hover:border-red-500/50 hover:scale-110"
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
                                        <h1 className="text-xl font-bold text-white mb-1">
                                            {user.name}
                                        </h1>
                                        <p className="text-gray-400 text-sm mb-4">
                                            {getEmailValue(user) || 'usuario@email.com'}
                                        </p>
                                        
                                        {/* Botão Conversar */}
                                        <Button 
                                            className="w-full bg-[#29292E] hover:bg-[#323238] border border-[#B3E240] px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                                        >
                                            <ShinyText 
                                                text="Conversar" 
                                                disabled={false} 
                                                speed={3} 
                                                className="font-medium"
                                            />
                                        </Button>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {basicInfoData.cidade ? (
                                            <div className="w-full bg-[#29292E] border border-[#323238] rounded-lg p-3 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-[#B3E240] rounded-full mr-4 flex-shrink-0"></div>
                                                    <span className="text-white text-sm font-medium">
                                                        {basicInfoData.cidade}
                                                    </span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setIsLocationModalOpen(true)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 hover:bg-white/10 cursor-pointer"
                                                >
                                                    <Edit3 className="w-3 h-3 text-gray-400" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                className="w-full bg-transparent hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400 text-gray-400 border border-[#323238] rounded-lg justify-start text-sm py-2 cursor-pointer transition-colors"
                                                onClick={() => setIsLocationModalOpen(true)}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Localização
                                            </Button>
                                        )}
                                        {selectedFocus ? (
                                            <div className="w-full bg-[#29292E] border border-[#323238] rounded-lg p-3 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-[#B3E240] rounded-full mr-3"></div>
                                                    <span className="text-white text-sm font-medium">
                                                        {getFocusLabel(selectedFocus, selectedCourse)}
                                                    </span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setIsFocusModalOpen(true)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 hover:bg-white/10 cursor-pointer"
                                                >
                                                    <Edit3 className="w-3 h-3 text-gray-400" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                className="w-full bg-transparent hover:bg-white/5 text-[#B3E240] border border-[#323238] rounded-lg justify-start text-sm py-2 cursor-pointer"
                                                onClick={() => setIsFocusModalOpen(true)}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Escolha seu foco
                                            </Button>
                                        )}
                                    </div>

                                    <p className="text-gray-500 text-sm text-center">
                                        {formatUserJoinDate(userProfile?.createdAt)}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-semibold">Links</h3>
                                        <Button
                                            className="bg-transparent hover:bg-white/5 text-white p-1 cursor-pointer"
                                            size="sm"
                                            onClick={() => setIsLinksModalOpen(true)}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {renderUserLinks()}
                                </div>

                                <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
                                    <h3 className="text-white font-semibold mb-4">Insígnias • 3</h3>
                                    <div className="flex space-x-3">
                                        <div className="w-12 h-12 bg-[#B3E240] rounded-full flex items-center justify-center cursor-pointer">
                                            <span className="text-black text-xs font-bold">R</span>
                                        </div>
                                        <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center cursor-pointer">
                                            <span className="text-white text-xs font-bold">G</span>
                                        </div>
                                        <div className="w-12 h-12 bg-[#B3E240] rounded-full flex items-center justify-center cursor-pointer">
                                            <span className="text-black text-xs font-bold">N</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
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
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profileTasks.map((task, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                                            onClick={() => handleTaskClick(task.label)}
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

                            <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-white">Sobre</h3>
                                    <Button
                                        className="bg-transparent hover:bg-white/5 text-gray-400 p-1 cursor-pointer"
                                        size="sm"
                                        onClick={() => setIsAboutModalOpen(true)}
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="text-gray-300 text-sm leading-relaxed">
                                    {user.aboutYou ? (
                                        <div 
                                            dangerouslySetInnerHTML={{ __html: user.aboutYou }}
                                            className="prose prose-invert prose-sm max-w-none"
                                        />
                                    ) : (
                                        <span className="text-gray-500">—</span>
                                    )}
                                </div>
                            </div>

                            {/* <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
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
                                    <Button className="bg-[#B3E240] hover:bg-[#A3D030] text-black px-6 py-2 rounded-lg font-medium flex items-center space-x-2 mx-auto cursor-pointer">
                                        <Plus className="w-4 h-4" />
                                        <span>Adicionar destaques</span>
                                    </Button>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para editar informações do perfil */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#202024] border-[#323238] text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white text-lg font-semibold">
                            {selectedTask}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} >
                        {selectedTask && getModalFields(selectedTask).map((field) => (
                            <div key={field.key} className='flex flex-col gap-2'>
                                <label className="text-sm text-gray-300 ">
                                    {field.label}
                                </label>
                                {field.type === 'textarea' ? (
                                    <Textarea
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        className="bg-[#29292E] cursor-pointer border-[#323238] text-white placeholder-gray-400 focus:border-[#B3E240] focus:ring-[#B3E240]"
                                        placeholder={`Digite ${field.label.toLowerCase()}...`}
                                        rows={3}
                                    />
                                ) : field.type === 'file' ? (
                                    <Input
                                        type="file"
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        className="bg-[#29292E] h-12 border-[#323238] p-2 text-white file:bg-[#B3E240] file:text-black file:border-0 file:px-2 cursor-pointer file:mr-4 file:min-w-[120px] file:rounded-md focus:!border-[#323238] focus:!ring-0 focus:!outline-none"
                                    />
                                ) : (
                                    <Input
                                        type={field.type}
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:border-[#B3E240] focus:ring-[#B3E240]"
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
                                className="bg-[#B3E240] hover:bg-[#A3D030] text-black cursor-pointer"
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

                    <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
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
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                                E-mail
                            </label>
                            <Input
                                type="email"
                                value={modalValues.email}
                                className="bg-[#1a1a1a] border-[#323238] text-gray-400 cursor-not-allowed"
                                placeholder="E-mail não pode ser alterado"
                                readOnly
                                disabled
                            />
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
                                className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer"
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
                                className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer"
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
                                className="bg-[#B3E240] hover:bg-[#A3D030] text-black cursor-pointer"
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
                                        ? 'bg-[#B3E240] text-black hover:bg-[#A3D030]'
                                        : 'border-[#323238] text-gray-300 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                                        }`}
                                >
                                    ENEM
                                </Button>
                                <Button
                                    variant={selectedFocus === 'CONCURSO' ? 'default' : 'outline'}
                                    onClick={() => handleFocusSelect('CONCURSO')}
                                    className={`h-12 text-sm cursor-pointer transition-colors ${selectedFocus === 'CONCURSO'
                                        ? 'bg-[#B3E240] text-black hover:bg-[#A3D030]'
                                        : 'border-[#323238] text-gray-300 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                                        }`}
                                >
                                    Concurso
                                </Button>
                                <Button
                                    variant={selectedFocus === 'FACULDADE' ? 'default' : 'outline'}
                                    onClick={() => handleFocusSelect('FACULDADE')}
                                    className={`h-12 text-sm cursor-pointer transition-colors ${selectedFocus === 'FACULDADE'
                                        ? 'bg-[#B3E240] text-black hover:bg-[#A3D030]'
                                        : 'border-[#323238] text-gray-300 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
                                        }`}
                                >
                                    Faculdade
                                </Button>
                                <Button
                                    variant={selectedFocus === 'ENSINO_MEDIO' ? 'default' : 'outline'}
                                    onClick={() => handleFocusSelect('ENSINO_MEDIO')}
                                    className={`h-12 text-sm cursor-pointer transition-colors ${selectedFocus === 'ENSINO_MEDIO'
                                        ? 'bg-[#B3E240] text-black hover:bg-[#A3D030]'
                                        : 'border-[#323238] text-gray-300 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400'
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
                                className="bg-[#B3E240] hover:bg-[#A3D030] text-black cursor-pointer"
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
                                className="bg-[#B3E240] hover:bg-[#A3D030] text-black cursor-pointer transition-colors"
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
                            className="bg-[#B3E240] hover:bg-[#A3D030] text-black cursor-pointer transition-colors"
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
            />
        </div>
    );
}
