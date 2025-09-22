'use client';

import { useState, useCallback } from 'react';
import { UserProfile } from '@/types/api/auth-api';
import { 
  BasicInfoData, 
  LinksData, 
  LinkField, 
  ProfileTask 
} from '@/types/ui/features/profile';
import { 
  Globe, 
  Linkedin, 
  Instagram, 
  Twitter, 
  Github 
} from 'lucide-react';

export function useProfile() {
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBasicInfoModalOpen, setIsBasicInfoModalOpen] = useState(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const [basicInfoData, setBasicInfoData] = useState<BasicInfoData>({
    nome: 'Aran Leite de Gusmão',
    areaAtuacao: '',
    empresa: '',
    nacionalidade: '',
    cidade: ''
  });
  
  const [selectedFocus, setSelectedFocus] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedContest, setSelectedContest] = useState<string>('');
  
  const [linksData, setLinksData] = useState<LinksData>({
    sitePessoal: '',
    linkedin: '',
    instagram: '',
    twitter: '',
    github: ''
  });
  
  const [linkFieldsOrder, setLinkFieldsOrder] = useState<LinkField[]>([
    { id: 'sitePessoal', field: 'sitePessoal', label: 'Site pessoal', icon: Globe, placeholder: 'https://seusite.com' },
    { id: 'linkedin', field: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/seuusuario' },
    { id: 'instagram', field: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/seuusuario' },
    { id: 'twitter', field: 'twitter', label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/seuusuario' },
    { id: 'github', field: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/seuusuario' }
  ]);
  
  const [aboutText, setAboutText] = useState<string>('');

  const profileTasks: ProfileTask[] = [
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

  const getInitials = useCallback((user: UserProfile): string => {
    const name = user.nome || user.name || user.email?.split('@')[0] || 'U';
    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);

  const handleAvatarUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleTaskClick = useCallback((taskLabel: string) => {
    setSelectedTask(taskLabel);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setFormData({});
  }, []);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleModalClose();
  }, [handleModalClose]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleBasicInfoChange = useCallback((field: string, value: string) => {
    setBasicInfoData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleBasicInfoSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsBasicInfoModalOpen(false);
  }, []);

  const handleBasicInfoModalClose = useCallback(() => {
    setIsBasicInfoModalOpen(false);
  }, []);

  const handleFocusModalClose = useCallback(() => {
    setIsFocusModalOpen(false);
    setSelectedFocus('');
    setSelectedCourse('');
    setSelectedContest('');
  }, []);

  const handleFocusSelect = useCallback((focus: string) => {
    setSelectedFocus(focus);
    if (focus === 'FACULDADE') {
      setSelectedCourse('');
    } else if (focus === 'CONCURSO') {
      setSelectedContest('');
    }
  }, []);

  const handleFocusSubmit = useCallback(() => {
    // TODO: Implement focus data submission
    handleFocusModalClose();
  }, [handleFocusModalClose]);

  const handleLinksChange = useCallback((field: string, value: string) => {
    setLinksData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleLinksSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsLinksModalOpen(false);
  }, []);

  const handleLinksModalClose = useCallback(() => {
    setIsLinksModalOpen(false);
  }, []);

  const handleAboutModalClose = useCallback(() => {
    setIsAboutModalOpen(false);
  }, []);

  const handleAboutSubmit = useCallback(() => {
    handleAboutModalClose();
  }, [handleAboutModalClose]);

  const getModalFields = useCallback((taskLabel: string) => {
    switch (taskLabel) {
      case 'Informações básicas':
        return [
          { key: 'nome', label: 'Nome completo', type: 'text' as const },
          { key: 'email', label: 'E-mail', type: 'email' as const },
          { key: 'idade', label: 'Idade', type: 'number' as const }
        ];
      case 'Foto do perfil':
        return [
          { key: 'foto', label: 'Upload da foto', type: 'file' as const }
        ];
      case 'Imagem de capa':
        return [
          { key: 'capa', label: 'Upload da imagem de capa', type: 'file' as const }
        ];
      case 'Links':
        return [
          { key: 'linkedin', label: 'LinkedIn', type: 'url' as const },
          { key: 'github', label: 'GitHub', type: 'url' as const },
          { key: 'portfolio', label: 'Portfolio', type: 'url' as const }
        ];
      case 'Sobre você':
        return [
          { key: 'sobre', label: 'Conte um pouco sobre você', type: 'textarea' as const }
        ];
      case 'Destaques':
        return [
          { key: 'projeto1', label: 'Projeto 1', type: 'url' as const },
          { key: 'projeto2', label: 'Projeto 2', type: 'url' as const },
          { key: 'projeto3', label: 'Projeto 3', type: 'url' as const }
        ];
      case 'Habilidades':
        return [
          { key: 'habilidades', label: 'Suas principais habilidades', type: 'textarea' as const }
        ];
      case 'Momento de carreira':
        return [
          { key: 'carreira', label: 'Descreva seu momento atual na carreira', type: 'textarea' as const }
        ];
      default:
        return [];
    }
  }, []);

  return {
    // State
    avatarImage,
    isModalOpen,
    isBasicInfoModalOpen,
    isFocusModalOpen,
    isLinksModalOpen,
    isAboutModalOpen,
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
    
    // Actions
    getInitials,
    handleAvatarUpload,
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
    getModalFields,
    
    // Setters
    setIsBasicInfoModalOpen,
    setIsFocusModalOpen,
    setIsLinksModalOpen,
    setIsAboutModalOpen,
    setAboutText,
    setLinkFieldsOrder
  };
}
