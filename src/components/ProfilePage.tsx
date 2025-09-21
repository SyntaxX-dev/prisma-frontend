'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    ArrowLeft
} from 'lucide-react';
import { countries } from '@/lib/constants/countries';
import { COLLEGE_COURSE_LABELS, CONTEST_TYPE_LABELS } from '@/types/auth-api';

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
    const [avatarImage, setAvatarImage] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBasicInfoModalOpen, setIsBasicInfoModalOpen] = useState(false);
    const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
    const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [basicInfoData, setBasicInfoData] = useState<Record<string, string>>({
        nome: 'Aran Leite de Gusmão',
        areaAtuacao: '',
        empresa: '',
        nacionalidade: '',
        cidade: ''
    });
    const [selectedFocus, setSelectedFocus] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedContest, setSelectedContest] = useState<string>('');
    const [linksData, setLinksData] = useState<Record<string, string>>({
        sitePessoal: '',
        linkedin: '',
        instagram: '',
        twitter: '',
        github: ''
    });
    const [linkFieldsOrder, setLinkFieldsOrder] = useState([
        { id: 'sitePessoal', field: 'sitePessoal', label: 'Site pessoal', icon: Globe, placeholder: 'https://seusite.com' },
        { id: 'linkedin', field: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/seuusuario' },
        { id: 'instagram', field: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/seuusuario' },
        { id: 'twitter', field: 'twitter', label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/seuusuario' },
        { id: 'github', field: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/seuusuario' }
    ]);
    const [aboutText, setAboutText] = useState<string>('');

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

    const user: UserProfile = {
        id: 'd99f095c-32e1-496e-b20e-73a554bb9538',
        nome: 'Aran Leite de Gusmão',
        name: 'Aran Leite de Gusmão',
        email: 'aran@gmail.com',
        age: 25,
        educationLevel: 'GRADUACAO' as const,
        userFocus: 'ENEM' as const,
        contestType: undefined,
        collegeCourse: undefined,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        perfil: 'ALUNO',
        notification: {
            hasNotification: true,
            missingFields: ['foco de estudo'],
            message: 'Complete seu perfil adicionando sua foco de estudo.',
            badge: null
        }
    };

    const profileTasks = [
        { label: 'Informações básicas', completed: false },
        { label: 'Foto do perfil', completed: true },
        { label: 'Imagem de capa', completed: false },
        { label: 'Links', completed: false },
        { label: 'Sobre você', completed: true },
        { label: 'Destaques', completed: false },
        { label: 'Habilidades', completed: false },
        { label: 'Momento de carreira', completed: false }
    ];

    const completedTasks = profileTasks.filter(task => task.completed).length;
    const totalTasks = profileTasks.length;
    const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

    const getInitials = (user: UserProfile) => {
        const name = user.nome || user.name || user.email?.split('@')[0] || 'U';
        return name
            .split(' ')
            .map((word: string) => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTaskClick = (taskLabel: string) => {
        setSelectedTask(taskLabel);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
        setFormData({});
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleModalClose();
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleBasicInfoChange = (field: string, value: string) => {
        setBasicInfoData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleBasicInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsBasicInfoModalOpen(false);
    };

    const handleBasicInfoModalClose = () => {
        setIsBasicInfoModalOpen(false);
    };

    const handleFocusModalClose = () => {
        setIsFocusModalOpen(false);
        setSelectedFocus('');
        setSelectedCourse('');
        setSelectedContest('');
    };

    const handleFocusSelect = (focus: string) => {
        setSelectedFocus(focus);
        if (focus === 'FACULDADE') {
            setSelectedCourse('');
        } else if (focus === 'CONCURSO') {
            setSelectedContest('');
        }
    };

    const handleFocusSubmit = () => {
        // TODO: Implement focus data submission
        handleFocusModalClose();
    };

    const handleLinksChange = (field: string, value: string) => {
        setLinksData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLinksSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLinksModalOpen(false);
    };

    const handleLinksModalClose = () => {
        setIsLinksModalOpen(false);
    };

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

    const handleAboutModalClose = () => {
        setIsAboutModalOpen(false);
    };

    const handleAboutSubmit = () => {
        handleAboutModalClose();
    };

    const handleGoBack = () => {
        router.back();
    };

    const getModalFields = (taskLabel: string) => {
        switch (taskLabel) {
            case 'Informações básicas':
                return [
                    { key: 'nome', label: 'Nome completo', type: 'text' },
                    { key: 'email', label: 'E-mail', type: 'email' },
                    { key: 'idade', label: 'Idade', type: 'number' }
                ];
            case 'Foto do perfil':
                return [
                    { key: 'foto', label: 'Upload da foto', type: 'file' }
                ];
            case 'Imagem de capa':
                return [
                    { key: 'capa', label: 'Upload da imagem de capa', type: 'file' }
                ];
            case 'Links':
                return [
                    { key: 'linkedin', label: 'LinkedIn', type: 'url' },
                    { key: 'github', label: 'GitHub', type: 'url' },
                    { key: 'portfolio', label: 'Portfolio', type: 'url' }
                ];
            case 'Sobre você':
                return [
                    { key: 'sobre', label: 'Conte um pouco sobre você', type: 'textarea' }
                ];
            case 'Destaques':
                return [
                    { key: 'projeto1', label: 'Projeto 1', type: 'url' },
                    { key: 'projeto2', label: 'Projeto 2', type: 'url' },
                    { key: 'projeto3', label: 'Projeto 3', type: 'url' }
                ];
            case 'Habilidades':
                return [
                    { key: 'habilidades', label: 'Suas principais habilidades', type: 'textarea' }
                ];
            case 'Momento de carreira':
                return [
                    { key: 'carreira', label: 'Descreva seu momento atual na carreira', type: 'textarea' }
                ];
            default:
                return [];
        }
    };

    return (
        <div className="min-h-screen bg-[#09090A] text-white">
            <div
                className="fixed inset-0 transition-all duration-300 bg-gray-950"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.04) 0%, transparent 50%)
                    `
                }}
            />

            <div
                className="fixed inset-0 pointer-events-none"
                aria-hidden="true"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 15% 10%, rgba(201, 254, 2, 0.06), transparent 20%),
                        radial-gradient(circle at 85% 90%, rgba(201, 254, 2, 0.04), transparent 20%)
                    `
                }}
            />

            <div
                className="fixed inset-0 backdrop-blur-sm transition-all duration-300 bg-black/30"
            />

            <div
                className="fixed inset-0 pointer-events-none"
                aria-hidden="true"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0'
                }}
            />


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
                <div className="max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">


                                    <div className="text-center mb-6">
                                        <div className="relative inline-block group mb-4">
                                            <Avatar
                                                className="w-24 h-24 cursor-pointer"
                                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                            >
                                                <AvatarImage src={avatarImage || "/api/placeholder/96/96"} className="object-cover" />
                                                <AvatarFallback className="text-xl font-bold bg-[#B3E240] text-black">
                                                    {getInitials(user)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                id="avatar-upload"
                                            />
                                        </div>
                                        <h1 className="text-xl font-bold text-white mb-1">
                                            {user.nome || user.name}
                                        </h1>
                                        <p className="text-gray-400 text-sm">
                                            @aran-leite
                                        </p>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <Button
                                            className="w-full bg-transparent hover:bg-white/5 text-gray-400 border border-[#323238] rounded-lg justify-start text-sm py-2 cursor-pointer"
                                            onClick={() => setIsBasicInfoModalOpen(true)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Título
                                        </Button>
                                        <Button
                                            className="w-full bg-transparent hover:bg-white/5 text-gray-400 border border-[#323238] rounded-lg justify-start text-sm py-2 cursor-pointer"
                                            onClick={() => setIsBasicInfoModalOpen(true)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Localização
                                        </Button>
                                        <Button
                                            className="w-full bg-transparent hover:bg-white/5 text-[#B3E240] border border-[#323238] rounded-lg justify-start text-sm py-2 cursor-pointer"
                                            onClick={() => setIsFocusModalOpen(true)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Escolha seu foco
                                        </Button>
                                    </div>

                                    <p className="text-gray-500 text-sm text-center">
                                        No Prisma desde 30/03/2020
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
                                    <div className="grid grid-cols-5 gap-3">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="aspect-square bg-transparent border-2 border-dashed border-[#323238] rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors cursor-pointer"
                                                onClick={() => setIsLinksModalOpen(true)}
                                            >
                                                <Plus className="w-5 h-5 text-gray-600" />
                                            </div>
                                        ))}
                                    </div>
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
                                <div className="text-gray-500 text-sm">
                                    <span>—</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#202024] via-[#1e1f23] to-[#1a1b1e] border border-[#323238] rounded-xl p-6 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#B3E240]/5 before:to-transparent before:pointer-events-none">
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
                            </div>
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

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {selectedTask && getModalFields(selectedTask).map((field) => (
                            <div key={field.key} className="space-y-2">
                                <label className="text-sm text-gray-300">
                                    {field.label}
                                </label>
                                {field.type === 'textarea' ? (
                                    <Textarea
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:border-[#B3E240] focus:ring-[#B3E240]"
                                        placeholder={`Digite ${field.label.toLowerCase()}...`}
                                        rows={3}
                                    />
                                ) : field.type === 'file' ? (
                                    <Input
                                        type="file"
                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                        className="bg-[#29292E] border-[#323238] text-white file:bg-[#B3E240] file:text-black file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3"
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

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleModalClose}
                                className="border-[#323238] text-gray-300 hover:bg-white/5"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#B3E240] hover:bg-[#A3D030] text-black"
                            >
                                Salvar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal para editar informações básicas */}
            <Dialog open={isBasicInfoModalOpen} onOpenChange={setIsBasicInfoModalOpen}>
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
                                value={basicInfoData.nome}
                                className="bg-[#1a1a1a] border-[#323238] text-gray-400 cursor-not-allowed"
                                placeholder="Nome não pode ser alterado"
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

                        {/* Cidade */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                                Cidade
                            </label>
                            <Input
                                type="text"
                                value={basicInfoData.cidade}
                                onChange={(e) => handleBasicInfoChange('cidade', e.target.value)}
                                className="bg-[#29292E] border-[#323238] text-white placeholder-gray-400 focus:!border-[#323238] focus:!ring-0 focus:!outline-none cursor-pointer"
                                placeholder="Em qual cidade você mora atualmente?"
                            />
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
        </div>
    );
}
