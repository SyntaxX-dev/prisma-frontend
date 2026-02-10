'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { UserProfile } from '@/types/auth-api';
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
import { getProfile } from '@/api/auth/get-profile';
import { 
  updateName, 
  updateAge, 
  updateProfileImage,
  uploadProfileImage,
  deleteProfileImage, 
  updateLinks,
  updateInstagram,
  updateTwitter,
  updateSocialLinksOrder, 
  updateAbout, 
  updateAboutYou,
  updateHabilities,
  updateMomentCareer,
  updateProfile,
  getNotifications 
} from '@/api/profile';
import { updateLocation } from '@/api/profile/update-location';
import { useClientOnly, useCacheInvalidation } from '../../shared';

export function useProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile: invalidateProfileCache } = useCacheInvalidation();
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBasicInfoModalOpen, setIsBasicInfoModalOpen] = useState(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isHabilitiesModalOpen, setIsHabilitiesModalOpen] = useState(false);
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const isClient = useClientOnly();
  
  
  const [basicInfoData, setBasicInfoData] = useState<BasicInfoData>({
    nome: '',
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


  // Função para carregar o perfil do usuário
  const loadUserProfile = useCallback(async () => {
    if (!isClient) return;

    // Verificar se existe token antes de fazer a chamada
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const profile = await getProfile();
      setUserProfile(profile);
      
      // Atualizar dados básicos com informações da API
      if (profile) {
        const basicInfo = {
          nome: profile.name || '',
          areaAtuacao: profile.userFocus || '',
          empresa: profile.contestType || profile.collegeCourse || '',
          nacionalidade: profile.location || '',
          cidade: profile.location || ''
        };
        setBasicInfoData(basicInfo);

        // Atualizar links com dados da API
        setLinksData({
          sitePessoal: profile.portfolio || '',
          linkedin: profile.linkedin || '',
          instagram: profile.instagram || '',
          twitter: profile.twitter || '',
          github: profile.github || ''
        });

        // Atualizar ordem dos links - usar ordem do backend ou ordem padrão
        const defaultOrder = ['linkedin', 'github', 'portfolio', 'instagram', 'twitter'];
        const order = profile.socialLinksOrder || defaultOrder;
        
        if (order && order.length > 0) {
          // Mapear campos do backend para frontend com ícones e labels corretos
          const fieldMap: Record<string, { label: string; icon: any; placeholder: string }> = {
            'sitePessoal': { label: 'Site pessoal', icon: Globe, placeholder: 'https://seusite.com' },
            'portfolio': { label: 'Site pessoal', icon: Globe, placeholder: 'https://seusite.com' },
            'linkedin': { label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/seuusuario' },
            'github': { label: 'GitHub', icon: Github, placeholder: 'https://github.com/seuusuario' },
            'instagram': { label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/seuusuario' },
            'twitter': { label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/seuusuario' }
          };
          
          const orderedFields = order.map(fieldName => {
            // Mapear portfolio do backend para sitePessoal no frontend
            const frontendFieldName = fieldName === 'portfolio' ? 'sitePessoal' : fieldName;
            const fieldInfo = fieldMap[frontendFieldName] || { label: frontendFieldName, icon: Globe, placeholder: '' };
            return {
              id: frontendFieldName,
              field: frontendFieldName,
              label: fieldInfo.label,
              icon: fieldInfo.icon,
              placeholder: fieldInfo.placeholder
            };
          });
          setLinkFieldsOrder(orderedFields);
        }

        // Atualizar sobre você
        setAboutText(profile.aboutYou || '');

        // Atualizar avatar se existir
        if (profile.profileImage) {
          setAvatarImage(profile.profileImage);
        }

        // Atualizar foco selecionado
        if (profile.userFocus) {
          setSelectedFocus(profile.userFocus);
        }

        // Atualizar curso ou concurso baseado no foco
        if (profile.userFocus === 'FACULDADE' && profile.collegeCourse) {
          setSelectedCourse(profile.collegeCourse);
        } else if (profile.userFocus === 'CONCURSO' && profile.contestType) {
          setSelectedContest(profile.contestType);
        }
      }
    } catch (err) {
      setError('Erro ao carregar dados do perfil');
    } finally {
      setIsLoading(false);
    }
  }, [isClient]);

  // Atualizar linkFieldsOrder quando userProfile.socialLinksOrder mudar
  useEffect(() => {
    // Ordem padrão conforme o guia
    const defaultOrder = ['linkedin', 'github', 'portfolio', 'instagram', 'twitter'];
    const order = userProfile?.socialLinksOrder || defaultOrder;
    
    if (order && order.length > 0) {
      // Mapear campos do backend para frontend com ícones e labels corretos
      const fieldMap: Record<string, { label: string; icon: any; placeholder: string }> = {
        'sitePessoal': { label: 'Site pessoal', icon: Globe, placeholder: 'https://seusite.com' },
        'portfolio': { label: 'Site pessoal', icon: Globe, placeholder: 'https://seusite.com' },
        'linkedin': { label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/seuusuario' },
        'github': { label: 'GitHub', icon: Github, placeholder: 'https://github.com/seuusuario' },
        'instagram': { label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/seuusuario' },
        'twitter': { label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/seuusuario' }
      };
      
      const orderedFields = order.map(fieldName => {
        // Mapear portfolio do backend para sitePessoal no frontend
        const frontendFieldName = fieldName === 'portfolio' ? 'sitePessoal' : fieldName;
        const fieldInfo = fieldMap[frontendFieldName] || { label: frontendFieldName, icon: Globe, placeholder: '' };
        return {
          id: frontendFieldName,
          field: frontendFieldName,
          label: fieldInfo.label,
          icon: fieldInfo.icon,
          placeholder: fieldInfo.placeholder
        };
      });
      
      // Sempre atualizar para garantir que a UI seja atualizada
      setLinkFieldsOrder(orderedFields);
    }
  }, [JSON.stringify(userProfile?.socialLinksOrder), userProfile?.id]);

  // Função centralizada para sincronizar todos os estados locais com o objeto de perfil
  const syncStatesFromProfile = useCallback((profile: UserProfile | null) => {
    if (!profile) return;

    // Sincronizar Informações Básicas
    setBasicInfoData({
      nome: profile.name || '',
      areaAtuacao: profile.userFocus || '',
      empresa: profile.contestType || profile.collegeCourse || '',
      nacionalidade: profile.location || '',
      cidade: profile.location || ''
    });

    // Sincronizar Foco
    if (profile.userFocus) {
      setSelectedFocus(profile.userFocus);
      if (profile.userFocus === 'FACULDADE' && profile.collegeCourse) {
        setSelectedCourse(profile.collegeCourse);
      } else if (profile.userFocus === 'CONCURSO' && profile.contestType) {
        setSelectedContest(profile.contestType);
      }
    }

    // Sincronizar Links
    setLinksData({
      sitePessoal: profile.portfolio || '',
      linkedin: profile.linkedin || '',
      instagram: profile.instagram || '',
      twitter: profile.twitter || '',
      github: profile.github || ''
    });

    // Sincronizar Sobre
    setAboutText(profile.aboutYou || '');

    // Sincronizar Avatar
    if (profile.profileImage) {
      setAvatarImage(profile.profileImage);
    }
  }, []);

  // Chamar sincronização sempre que o userProfile mudar
  useEffect(() => {
    if (userProfile) {
      syncStatesFromProfile(userProfile);
    }
  }, [userProfile, syncStatesFromProfile]);

  // Função para atualizar o perfil local sem recarregar
  const updateLocalProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Calcula notificações localmente (sem API) para atualização otimista
  const calculateNotificationsLocally = useCallback((profile: UserProfile) => {
    const missingFields: string[] = [];
    const completedFields: string[] = [];

    const profileFields = [
      { key: 'name', label: 'nome', weight: 10 },
      { key: 'email', label: 'email', weight: 10 },
      { key: 'age', label: 'idade', weight: 10 },
      { key: 'profileImage', label: 'foto do perfil', weight: 10 },
      { key: 'linkedin', label: 'LinkedIn', weight: 5 },
      { key: 'github', label: 'GitHub', weight: 5 },
      { key: 'portfolio', label: 'portfólio', weight: 5 },
      { key: 'aboutYou', label: 'sobre você', weight: 15 },
      { key: 'habilities', label: 'habilidades', weight: 15 },
      { key: 'momentCareer', label: 'momento de carreira', weight: 10 },
      { key: 'location', label: 'localização', weight: 5 },
      { key: 'userFocus', label: 'foco de estudo', weight: 10 },
      { key: 'educationLevel', label: 'nível de educação', weight: 10 },
    ];

    let totalWeight = 0;
    let completedWeight = 0;

    for (const field of profileFields) {
      const value = profile[field.key as keyof UserProfile];
      const isCompleted = value !== null && value !== undefined && value !== '';

      if (isCompleted) {
        completedFields.push(field.label);
        completedWeight += field.weight;
      } else {
        missingFields.push(field.label);
      }

      totalWeight += field.weight;
    }

    // Campos específicos baseados no foco
    if (profile.userFocus === 'CONCURSO') {
      totalWeight += 5;
      if (profile.contestType) completedWeight += 5;
    }
    if (profile.userFocus === 'FACULDADE') {
      totalWeight += 5;
      if (profile.collegeCourse) completedWeight += 5;
    }

    const profileCompletionPercentage = Math.round((completedWeight / totalWeight) * 100);
    const hasNotification = missingFields.length > 0;

    let message = '';
    if (hasNotification) {
      if (missingFields.length === 1) {
        message = `Complete seu perfil adicionando sua ${missingFields[0]}.`;
      } else {
        const fieldsCopy = [...missingFields];
        const lastField = fieldsCopy.pop();
        const otherFields = fieldsCopy.join(', ');
        message = `Complete seu perfil adicionando suas informações: ${otherFields} e ${lastField}.`;
      }
    } else {
      message = `Perfil ${profileCompletionPercentage}% completo!`;
    }

    return {
      hasNotification,
      missingFields,
      message,
      badge: profile.badge || null,
      profileCompletionPercentage,
      completedFields,
    };
  }, []);

  // Função para atualizar notificações de forma otimista (sem API)
  const updateNotificationsOptimistically = useCallback((updatedProfile: UserProfile) => {
    const notifications = calculateNotificationsLocally(updatedProfile);

    setUserProfile(prev => prev ? { ...prev, notification: notifications } : null);

    // Disparar evento para sincronizar notificações com outros componentes (ex: Navbar)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('profile-notifications-updated', {
        detail: notifications
      }));
    }
  }, [calculateNotificationsLocally]);

  // Função para calcular porcentagem baseada nos campos preenchidos
  const calculateProfilePercentage = useCallback((profile: UserProfile) => {
    let percentage = 0;
    
    // Campos obrigatórios (50% do total)
    if (profile.name && profile.name.trim() !== '') percentage += 10; // nome
    if (profile.email) percentage += 10; // email (sempre preenchido)
    if (profile.age && profile.age > 0) percentage += 10; // idade
    if (profile.userFocus) percentage += 10; // foco de estudo
    if (profile.educationLevel) percentage += 10; // nível de educação
    
    // Campos opcionais (50% do total)
    if (profile.profileImage && profile.profileImage.trim() !== '') percentage += 10; // foto do perfil
    
    // Links: só conta se TODOS os três estiverem preenchidos
    const hasLinkedin = profile.linkedin && profile.linkedin.trim() !== '';
    const hasGithub = profile.github && profile.github.trim() !== '';
    const hasPortfolio = profile.portfolio && profile.portfolio.trim() !== '';
    if (hasLinkedin && hasGithub && hasPortfolio) {
      percentage += 15; // 5% para cada link (total 15%)
    }
    
    if (profile.aboutYou && profile.aboutYou.trim() !== '') percentage += 15; // sobre você
    if (profile.habilities && profile.habilities.trim() !== '') percentage += 15; // habilidades
    if (profile.momentCareer && profile.momentCareer.trim() !== '') percentage += 10; // momento de carreira
    if (profile.location && profile.location.trim() !== '') percentage += 5; // localização
    
    return Math.min(percentage, 100); // Máximo 100%
  }, []);

  // Função auxiliar para atualizar porcentagem
  const updateProfilePercentage = useCallback((updatedProfile: UserProfile) => {
    const newPercentage = calculateProfilePercentage(updatedProfile);
    // Usar o perfil atualizado em vez do userProfile do estado
    if (updatedProfile?.notification) {
      updateLocalProfile({ 
        notification: { 
          ...updatedProfile.notification, 
          profileCompletionPercentage: newPercentage 
        } 
      });
    }
  }, [calculateProfilePercentage, updateLocalProfile]);

  // Função para recarregar o perfil do backend após atualizações
  const refreshProfile = useCallback(async () => {
    try {
      const updatedProfile = await getProfile();
      setUserProfile(updatedProfile);
      // Invalidar cache do perfil para garantir consistência
      await invalidateProfileCache();
    } catch (error) {
      throw error; // Re-throw para que a função chamadora possa capturar
    }
  }, [invalidateProfileCache]);

  // Funções de atualização de perfil
  const updateUserName = useCallback(async (name: string) => {
    try {
      await updateName(name);
      // Recarregar perfil do backend para obter dados atualizados
      await refreshProfile();
    } catch (error) {
      setError('Erro ao atualizar nome');
    }
  }, [refreshProfile]);

  const updateUserAge = useCallback(async (age: number) => {
    try {
      await updateAge(age);
      // Recarregar perfil do backend para obter dados atualizados
      await refreshProfile();
    } catch (error) {
      setError('Erro ao atualizar idade');
    }
  }, [refreshProfile]);

  const updateUserProfileImage = useCallback(async (profileImage: string) => {
    try {
      await updateProfileImage(profileImage);
      setAvatarImage(profileImage);
      // Recarregar perfil do backend para obter dados atualizados
      await refreshProfile();
    } catch (error) {
      setError('Erro ao atualizar foto do perfil');
    }
  }, [refreshProfile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const deleteUserProfileImage = useCallback(async () => {
    try {
      await deleteProfileImage();
      setAvatarImage(null);
      // Recarregar perfil do backend para obter dados atualizados
      await refreshProfile();
    } catch (error) {
      setError('Erro ao remover foto do perfil');
    }
  }, [refreshProfile]);

  const updateUserLinks = useCallback(async (links: { linkedin?: string; github?: string; portfolio?: string }) => {
    try {
      await updateLinks(links);
      // Recarregar perfil do backend para obter dados atualizados
      await refreshProfile();
    } catch (error) {
      setError('Erro ao atualizar links');
    }
  }, [refreshProfile]);

  const updateUserAbout = useCallback(async (about: { aboutYou?: string; habilities?: string; momentCareer?: string; location?: string }) => {
    try {
      await updateAbout(about);
      // Recarregar perfil do backend para obter dados atualizados
      await refreshProfile();
    } catch (error) {
      setError('Erro ao atualizar informações pessoais');
    }
  }, [refreshProfile]);

  const updateUserAboutYou = useCallback(async (aboutYou: string) => {
    try {
      await updateAboutYou(aboutYou);
      // Recarregar perfil do backend para obter dados atualizados
      await refreshProfile();
    } catch (error) {
      setError('Erro ao atualizar sobre você');
    }
  }, [refreshProfile]);

  const updateUserMomentCareer = useCallback(async (momentCareer: string | null) => {
    try {
      // Enviar null se string vazia ou null, senão enviar a string
      const momentCareerToSend = (momentCareer && momentCareer.trim() !== '') ? momentCareer.trim() : null;
      
      // Validar tamanho máximo
      if (momentCareerToSend && momentCareerToSend.length > 500) {
        throw new Error('O momento de carreira deve ter no máximo 500 caracteres');
      }
      
      const response = await updateProfile({ momentCareer: momentCareerToSend || undefined });
      
      // Recarregar perfil do backend para obter dados atualizados
      await refreshProfile();
    } catch (error: any) {
      setError('Erro ao atualizar momento de carreira');
      throw error; // Re-throw para que o modal possa capturar
    }
  }, [refreshProfile]);

  const updateUserHabilities = useCallback(async (habilities: string[] | null) => {
    try {
      // Enviar null se array vazio ou null, senão enviar o array
      const habilitiesToSend = (habilities && habilities.length > 0) ? habilities : null;
      await updateHabilities(habilitiesToSend);
      
      // Recarregar perfil do backend para obter dados atualizados
      await refreshProfile();
    } catch (error) {
      setError('Erro ao atualizar habilidades');
      throw error; // Re-throw para que o modal possa tratar o erro
    }
  }, [refreshProfile]);

  const updateUserLocation = useCallback(async (location: string, visibility?: 'PUBLIC' | 'STATE_ONLY' | 'PRIVATE') => {
    try {
      await updateLocation(location, visibility);
      // Recarregar perfil do backend para obter dados atualizados
      await refreshProfile();
    } catch (error) {
      setError('Erro ao atualizar localização');
    }
  }, [refreshProfile]);

  const updateUserProfile = useCallback(async (profileData: any) => {
    try {
      await updateProfile(profileData);
      // Recarregar perfil do backend para obter dados atualizados
      await refreshProfile();
    } catch (error) {
      setError('Erro ao atualizar perfil');
    }
  }, [refreshProfile]);

  const refreshNotifications = useCallback(async () => {
    try {
      const notifications = await getNotifications();
      updateLocalProfile({ notification: notifications });
    } catch (error) {
    }
  }, [updateLocalProfile]);

  // Carregar perfil ao montar o componente
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Calcular tarefas baseado nos dados reais do perfil para garantir sincronia com a porcentagem
  const profileTasks = useMemo<ProfileTask[]>(() => {
    // Pegar campos do backend como fallback ou complemento
    const completedFields = userProfile?.notification?.completedFields || [];
    const lowerFields = completedFields.map(f => f.toLowerCase());
    
    return [
      { 
        label: 'Informações básicas', 
        // Considerar completo se tiver nome e idade (os campos principais do modal)
        completed: !!(userProfile?.name && userProfile?.age) || 
                  (lowerFields.includes('nome') && lowerFields.includes('idade'))
      },
      { 
        label: 'Foto do perfil', 
        completed: !!userProfile?.profileImage || lowerFields.includes('foto do perfil')
      },
      { 
        label: 'Links', 
        // Considerar completo se tiver pelo menos UM dos links principais
        completed: !!(userProfile?.linkedin || userProfile?.github || userProfile?.portfolio) ||
                  (lowerFields.includes('linkedin') || lowerFields.includes('github') || lowerFields.includes('portfólio'))
      },
      { 
        label: 'Sobre você', 
        completed: !!userProfile?.aboutYou || lowerFields.includes('sobre você')
      },
      { 
        label: 'Habilidades', 
        completed: !!userProfile?.habilities || lowerFields.includes('habilidades')
      },
      { 
        label: 'Momento de carreira', 
        completed: !!userProfile?.momentCareer || lowerFields.includes('momento de carreira')
      }
    ];
  }, [userProfile]);

  const completedTasks = useMemo(() => profileTasks.filter(task => task.completed).length, [profileTasks]);
  const totalTasks = profileTasks.length;
  
  // Usar porcentagem da API se disponível, senão calcular localmente
  const completionPercentage = useMemo(() => {
    if (userProfile?.notification?.profileCompletionPercentage !== undefined) {
      return userProfile.notification.profileCompletionPercentage;
    }
    if (userProfile) {
      return calculateProfilePercentage(userProfile);
    }
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }, [userProfile, calculateProfilePercentage, completedTasks, totalTasks]);

  const getInitials = useCallback((user: UserProfile): string => {
    const emailValue = typeof user.email === 'string' ? user.email : user.email?.value || '';
    const name = user.name || emailValue.split('@')[0] || 'U';
    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);

  const handleAvatarUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploadingImage(true);
        setError(null);

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/') && !file.type.includes('svg')) {
          setError('Formato de arquivo não suportado. Por favor, envie uma imagem (JPG, PNG, SVG, etc).');
          // Resetar input para permitir nova seleção
          event.target.value = '';
          return;
        }

        // Validar tamanho do arquivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('A imagem deve ter no máximo 5MB');
          // Resetar input para permitir nova seleção
          event.target.value = '';
          return;
        }
        
        // Fazer upload da imagem
        const response = await uploadProfileImage(file);
        
        if (response.data.profileImage) {
          // Atualizar a imagem local
          setAvatarImage(response.data.profileImage);
          
          // Recarregar o perfil para obter dados atualizados
          await refreshProfile();
        }
      } catch (error) {
        setError('Erro ao fazer upload da imagem. Tente novamente.');
      } finally {
        setIsUploadingImage(false);
        // Resetar o input file para permitir selecionar o mesmo arquivo novamente
        event.target.value = '';
      }
    }
  }, [refreshProfile]);

  const handleTaskClick = useCallback((taskLabel: string) => {
    // Se for Habilidades, abrir o modal específico
    if (taskLabel === 'Habilidades') {
      setIsHabilitiesModalOpen(true);
      return;
    }
    
    setSelectedTask(taskLabel);
    setIsModalOpen(true);
    
    // Preencher formData com dados da API baseado na tarefa selecionada
    if (userProfile) {
      switch (taskLabel) {
        case 'Informações básicas':
          const emailValue = typeof userProfile.email === 'string' ? userProfile.email : userProfile.email?.value || '';
          setFormData({
            nome: userProfile.name || '',
            email: emailValue,
            idade: userProfile.age ? userProfile.age.toString() : ''
          });
          break;
        case 'Links':
          setFormData({
            linkedin: userProfile.linkedin || '',
            github: userProfile.github || '',
            portfolio: userProfile.portfolio || ''
          });
          break;
        case 'Sobre você':
          setFormData({
            sobre: userProfile.aboutYou || ''
          });
          break;
        case 'Momento de carreira':
          setFormData({
            carreira: userProfile.momentCareer || ''
          });
          break;
        default:
          setFormData({});
      }
    }
  }, [userProfile]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setFormData({});
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTask || !userProfile) {
      handleModalClose();
      return;
    }

    try {
      switch (selectedTask) {
        case 'Informações básicas':
          if (formData.nome && formData.nome !== userProfile.name) {
            await updateUserName(formData.nome);
          }
          if (formData.idade && parseInt(formData.idade) !== userProfile.age) {
            await updateUserAge(parseInt(formData.idade));
          }
          break;
        case 'Links':
          await updateUserLinks({
            linkedin: formData.linkedin || undefined,
            github: formData.github || undefined,
            portfolio: formData.portfolio || undefined
          });
          break;
        case 'Sobre você':
          await updateUserAboutYou(formData.sobre?.trim() || '');
          break;
        case 'Habilidades':
          const habilitiesArray = formData.habilidades ?
            formData.habilidades.split(',').map(h => h.trim()).filter(h => h) : [];
          await updateUserHabilities(habilitiesArray);
          break;
        case 'Momento de carreira':
          const momentCareerValue = formData.carreira?.trim() || '';
          await updateUserMomentCareer(momentCareerValue === '' ? null : momentCareerValue);
          break;
      }

      // Atualização otimista das notificações (sem API)
      const updatedProfile = {
        ...userProfile,
        name: formData.nome || userProfile.name,
        age: formData.idade ? parseInt(formData.idade) : userProfile.age,
        linkedin: formData.linkedin || userProfile.linkedin,
        github: formData.github || userProfile.github,
        portfolio: formData.portfolio || userProfile.portfolio,
        aboutYou: formData.sobre?.trim() || userProfile.aboutYou,
        habilities: formData.habilidades ? formData.habilidades.split(',').map(h => h.trim()).filter(h => h) : userProfile.habilities,
        momentCareer: formData.carreira?.trim() || userProfile.momentCareer,
      } as UserProfile;
      updateNotificationsOptimistically(updatedProfile);
    } catch (error) {
    } finally {
      handleModalClose();
    }
  }, [selectedTask, formData, userProfile, updateUserName, updateUserAge, updateUserLinks, updateUserAboutYou, updateUserHabilities, updateUserMomentCareer, handleModalClose, updateNotificationsOptimistically]);

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

  const handleBasicInfoSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile) {
      setIsBasicInfoModalOpen(false);
      return;
    }

    try {
      // Atualizar nome se mudou
      if (basicInfoData.nome && basicInfoData.nome !== userProfile.name) {
        await updateUserName(basicInfoData.nome);
      }

      // Atualização otimista das notificações
      const updatedProfile = {
        ...userProfile,
        name: basicInfoData.nome || userProfile.name,
      } as UserProfile;
      updateNotificationsOptimistically(updatedProfile);
    } catch (error) {
    } finally {
      setIsBasicInfoModalOpen(false);
    }
  }, [basicInfoData, userProfile, updateUserName, updateNotificationsOptimistically]);

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

  const handleFocusSubmit = useCallback(async () => {
    if (!userProfile || !selectedFocus) {
      handleFocusModalClose();
      return;
    }

    try {
      const updateData: any = { userFocus: selectedFocus };

      if (selectedFocus === 'CONCURSO' && selectedContest) {
        updateData.contestType = selectedContest;
      }

      if (selectedFocus === 'FACULDADE' && selectedCourse) {
        updateData.collegeCourse = selectedCourse;
      }

      await updateUserProfile(updateData);

      // Atualização otimista das notificações
      const updatedProfile = {
        ...userProfile,
        userFocus: selectedFocus,
        contestType: selectedFocus === 'CONCURSO' ? selectedContest : userProfile.contestType,
        collegeCourse: selectedFocus === 'FACULDADE' ? selectedCourse : userProfile.collegeCourse,
      } as UserProfile;
      updateNotificationsOptimistically(updatedProfile);
    } catch (error) {
    } finally {
      handleFocusModalClose();
    }
  }, [userProfile, selectedFocus, selectedContest, selectedCourse, updateUserProfile, handleFocusModalClose, updateNotificationsOptimistically]);

  const handleLinksChange = useCallback((field: string, value: string) => {
    setLinksData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleLinksSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      setIsLinksModalOpen(false);
      return;
    }

    try {
      // Verificar se houve mudanças nos links existentes
      const hasLinkChanges = 
        linksData.linkedin !== (userProfile?.linkedin || '') ||
        linksData.github !== (userProfile?.github || '') ||
        linksData.sitePessoal !== (userProfile?.portfolio || '');

      // Verificar se houve mudanças no Instagram
      const hasInstagramChange = linksData.instagram !== (userProfile?.instagram || '');

      // Verificar se houve mudanças no Twitter
      const hasTwitterChange = linksData.twitter !== (userProfile?.twitter || '');

      // Verificar se houve mudanças na ordem
      const currentOrder = linkFieldsOrder.map(field => {
        return field.field === 'sitePessoal' ? 'portfolio' : field.field;
      });
      
      // Ordem padrão conforme o guia
      const defaultOrder = ['linkedin', 'github', 'portfolio', 'instagram', 'twitter'];
      const backendOrder = userProfile?.socialLinksOrder || defaultOrder;
      const hasOrderChange = JSON.stringify(currentOrder) !== JSON.stringify(backendOrder);

      // Fazer chamadas apenas se houver mudanças
      if (hasLinkChanges) {
        await updateUserLinks({
          linkedin: linksData.linkedin || undefined,
          github: linksData.github || undefined,
          portfolio: linksData.sitePessoal || undefined
        });
      }

      if (hasInstagramChange) {
        await updateInstagram(linksData.instagram);
        // Atualizar estado local imediatamente
        setUserProfile(prev => {
          if (!prev) return null;
          return { ...prev, instagram: linksData.instagram || null };
        });
      }

      if (hasTwitterChange) {
        await updateTwitter(linksData.twitter);
        // Atualizar estado local imediatamente
        setUserProfile(prev => {
          if (!prev) return null;
          return { ...prev, twitter: linksData.twitter || null };
        });
      }

      if (hasOrderChange) {
        // Validar a ordem conforme o guia
        const validLinks = ['linkedin', 'github', 'portfolio', 'instagram', 'twitter'];
        
        // Preservar a ordem atual do drag and drop
        // Apenas garantir que todos os 5 campos estejam presentes
        const completeOrder = currentOrder.filter(field => validLinks.includes(field));
        const missingFields = validLinks.filter(field => !completeOrder.includes(field));
        
        // Se faltar algum campo, adicionar no final, mas preservar a ordem original
        const finalOrder = completeOrder.length === 5
          ? completeOrder  // Se já tem todos os 5, usar a ordem como está
          : [...completeOrder, ...missingFields]; // Se faltar algum, adicionar no final

        // Validação: deve conter exatamente 5 links
        if (finalOrder.length !== 5) {
          throw new Error('A ordem deve conter exatamente 5 links');
        }
        
        // Validação: deve conter todos os links válidos
        const hasAllLinks = validLinks.every((link) => finalOrder.includes(link));
        if (!hasAllLinks) {
          throw new Error('A ordem deve conter todos os links: linkedin, github, portfolio, instagram, twitter');
        }
        
        // Validação: não pode ter links inválidos
        const hasOnlyValidLinks = finalOrder.every((link) => validLinks.includes(link));
        if (!hasOnlyValidLinks) {
          throw new Error('A ordem contém links inválidos');
        }
        
        // Validação: não pode ter duplicatas
        const uniqueLinks = new Set(finalOrder);
        if (uniqueLinks.size !== finalOrder.length) {
          throw new Error('A ordem não pode ter links duplicados');
        }
        
        // OPTIMISTIC UPDATE: Atualizar o estado local IMEDIATAMENTE antes da chamada da API
        const previousOrder = userProfile?.socialLinksOrder ? [...userProfile.socialLinksOrder] : null;
        
        if (userProfile) {
          setUserProfile(prev => {
            if (!prev) return null;
            // Criar uma nova referência do array para garantir que o React detecte a mudança
            return {
              ...prev,
              socialLinksOrder: [...finalOrder] // Nova referência do array
            };
          });
        }
        
        try {
          await updateSocialLinksOrder(finalOrder);

          // Se chegou aqui, a API foi bem-sucedida, então manter o estado atualizado
          // Recarregar o perfil do backend em background para garantir sincronização
          refreshProfile().catch(console.error);
        } catch (error) {
          // Se a API falhar, reverter para a ordem anterior
          console.error('❌ Erro ao salvar ordem, revertendo...', error);
          if (userProfile && previousOrder) {
            setUserProfile(prev => {
              if (!prev) return null;
              return {
                ...prev,
                socialLinksOrder: previousOrder
              };
            });
          }
          // Re-lançar o erro para que seja tratado no catch externo
          throw error;
        }
      }
      
      // Atualização otimista das notificações
      const updatedProfile = {
        ...userProfile,
        linkedin: linksData.linkedin || userProfile.linkedin,
        github: linksData.github || userProfile.github,
        portfolio: linksData.sitePessoal || userProfile.portfolio,
        instagram: linksData.instagram || userProfile.instagram,
        twitter: linksData.twitter || userProfile.twitter,
      } as UserProfile;
      updateNotificationsOptimistically(updatedProfile);
    } catch (error: any) {
      // Tratamento de erros conforme o guia
      if (error?.response?.status === 400) {
        setError(error?.response?.data?.message || 'Ordem inválida. Verifique se todos os links estão presentes.');
      } else if (error?.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (error?.message) {
        setError(error.message);
      } else {
        setError('Erro ao salvar ordem dos links. Tente novamente.');
      }
      // Reverter para ordem anterior em caso de erro
      if (userProfile?.socialLinksOrder) {
        const defaultOrder = ['linkedin', 'github', 'portfolio', 'instagram', 'twitter'];
        const order = userProfile.socialLinksOrder || defaultOrder;
        const fieldMap: Record<string, { label: string; icon: any; placeholder: string }> = {
          'sitePessoal': { label: 'Site pessoal', icon: Globe, placeholder: 'https://seusite.com' },
          'portfolio': { label: 'Site pessoal', icon: Globe, placeholder: 'https://seusite.com' },
          'linkedin': { label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/seuusuario' },
          'github': { label: 'GitHub', icon: Github, placeholder: 'https://github.com/seuusuario' },
          'instagram': { label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/seuusuario' },
          'twitter': { label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/seuusuario' }
        };
        const orderedFields = order.map(fieldName => {
          const frontendFieldName = fieldName === 'portfolio' ? 'sitePessoal' : fieldName;
          const fieldInfo = fieldMap[frontendFieldName] || { label: frontendFieldName, icon: Globe, placeholder: '' };
          return {
            id: frontendFieldName,
            field: frontendFieldName,
            label: fieldInfo.label,
            icon: fieldInfo.icon,
            placeholder: fieldInfo.placeholder
          };
        });
        setLinkFieldsOrder(orderedFields);
      }
    } finally {
      setIsLinksModalOpen(false);
    }
  }, [userProfile, linksData, linkFieldsOrder, updateUserLinks, updateNotificationsOptimistically, refreshProfile]);

  const handleLinksModalClose = useCallback(() => {
    setIsLinksModalOpen(false);
  }, []);

  const handleAboutModalClose = useCallback(() => {
    setIsAboutModalOpen(false);
  }, []);

  const handleAboutSubmit = useCallback(async () => {
    if (!userProfile) {
      handleAboutModalClose();
      return;
    }

    try {
      // Permitir campo vazio (agora o backend aceita nulo)
      await updateUserAboutYou(aboutText?.trim() || '');

      // Atualização otimista das notificações
      const updatedProfile = {
        ...userProfile,
        aboutYou: aboutText?.trim() || userProfile.aboutYou,
      } as UserProfile;
      updateNotificationsOptimistically(updatedProfile);
    } catch (error) {
      setError('Erro ao atualizar sobre você');
    } finally {
      handleAboutModalClose();
    }
  }, [userProfile, aboutText, updateUserAboutYou, handleAboutModalClose, updateNotificationsOptimistically]);

  const handleHabilitiesModalClose = useCallback(() => {
    setIsHabilitiesModalOpen(false);
  }, []);

  const handleHabilitiesSubmit = useCallback(async (habilities: string[]) => {
    if (!userProfile) return;

    try {
      await updateUserHabilities(habilities);

      // Atualização otimista das notificações (habilities é string no UserProfile)
      const updatedProfile = {
        ...userProfile,
        habilities: habilities.join(', '),
      } as UserProfile;
      updateNotificationsOptimistically(updatedProfile);
    } catch (error) {
      throw error;
    }
  }, [userProfile, updateUserHabilities, updateNotificationsOptimistically]);

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
    
    // Actions
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
    
    // Profile update functions
    updateUserName,
    updateUserAge,
    updateUserProfileImage,
    updateUserLinks,
    updateUserAbout,
    updateUserAboutYou,
    updateUserMomentCareer,
    updateUserHabilities,
    updateUserLocation,
    updateUserProfile,
    refreshNotifications,
    
    // Setters
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
  };
}
