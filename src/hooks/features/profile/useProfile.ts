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
import { useClientOnly } from '../../shared';

export function useProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    
    try {
      setIsLoading(true);
      setError(null);
      const profile = await getProfile();
      setUserProfile(profile);
      
      // Atualizar dados básicos com informações da API
      if (profile) {
        // Verificar quais campos estão completos baseado no completedFields
        const completedFields = profile.notification?.completedFields || [];
        
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
    
    // Usar JSON.stringify para criar uma chave única baseada na ordem
    const orderKey = JSON.stringify(order);
    
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
  }, [JSON.stringify(userProfile?.socialLinksOrder), userProfile?.id]); // Usar JSON.stringify para detectar mudanças no array

  // Função para atualizar o perfil local sem recarregar
  const updateLocalProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Função para atualizar notificações após mudanças
  const updateNotificationsAfterChange = useCallback(async () => {
    try {
      const notifications = await getNotifications();
      updateLocalProfile({ notification: notifications });
    } catch (error) {
    }
  }, [updateLocalProfile]);

  // Funções para verificar se todos os campos de um modal foram preenchidos
  const isBasicInfoComplete = useCallback((data: any) => {
    return data.nome && data.nome.trim() !== '' && 
           data.idade && parseInt(data.idade) > 0;
  }, []);

  const isLinksComplete = useCallback((data: any) => {
    return (data.linkedin && data.linkedin.trim() !== '') &&
           (data.github && data.github.trim() !== '') &&
           (data.portfolio && data.portfolio.trim() !== '');
  }, []);

  const isAboutComplete = useCallback((data: any) => {
    return data.aboutYou && data.aboutYou.trim() !== '';
  }, []);

  const isHabilitiesComplete = useCallback((data: any) => {
    return data.habilities && data.habilities.trim() !== '';
  }, []);

  const isCareerComplete = useCallback((data: any) => {
    return data.momentCareer && data.momentCareer.trim() !== '';
  }, []);

  const isFocusComplete = useCallback((focus: string, contest?: string, course?: string) => {
    if (focus === 'CONCURSO') {
      return contest && contest.trim() !== '';
    }
    if (focus === 'FACULDADE') {
      return course && course.trim() !== '';
    }
    return focus && focus.trim() !== '';
  }, []);

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
    } catch (error) {
      throw error; // Re-throw para que a função chamadora possa capturar
    }
  }, []);

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

  const updateUserLocation = useCallback(async (location: string) => {
    try {
      await updateLocation(location);
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

  // Calcular tarefas baseado nos campos completos da API
  const completedFields = userProfile?.notification?.completedFields || [];
  
  const profileTasks: ProfileTask[] = [
    { 
      label: 'Informações básicas', 
      completed: completedFields.includes('nome') && completedFields.includes('email') && completedFields.includes('nível de educação') && completedFields.includes('idade')
    },
    { 
      label: 'Foto do perfil', 
      completed: completedFields.includes('foto do perfil')
    },
    { 
      label: 'Links', 
      // Links só é completo se TODOS os três campos estiverem preenchidos
      completed: completedFields.includes('LinkedIn') && completedFields.includes('GitHub') && completedFields.includes('portfólio')
    },
    { 
      label: 'Sobre você', 
      completed: completedFields.includes('sobre você')
    },
    { 
      label: 'Habilidades', 
      completed: completedFields.includes('habilidades')
    },
    { 
      label: 'Momento de carreira', 
      completed: completedFields.includes('momento de carreira')
    }
  ];

  const completedTasks = profileTasks.filter(task => task.completed).length;
  const totalTasks = profileTasks.length;
  
  // Usar porcentagem da API se disponível, senão calcular localmente
  const completionPercentage = userProfile?.notification?.profileCompletionPercentage 
    ? userProfile.notification.profileCompletionPercentage 
    : userProfile 
      ? calculateProfilePercentage(userProfile)
      : Math.round((completedTasks / totalTasks) * 100);

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
        if (!file.type.startsWith('image/')) {
          setError('Por favor, selecione apenas arquivos de imagem');
          return;
        }

        // Validar tamanho do arquivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('A imagem deve ter no máximo 5MB');
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
      let allFieldsComplete = false;

      switch (selectedTask) {
        case 'Informações básicas':
          allFieldsComplete = isBasicInfoComplete(formData);
          if (formData.nome && formData.nome !== userProfile.name) {
            await updateUserName(formData.nome);
          }
          if (formData.idade && parseInt(formData.idade) !== userProfile.age) {
            await updateUserAge(parseInt(formData.idade));
          }
          break;
        case 'Links':
          allFieldsComplete = isLinksComplete(formData);
          await updateUserLinks({
            linkedin: formData.linkedin || undefined,
            github: formData.github || undefined,
            portfolio: formData.portfolio || undefined
          });
          break;
        case 'Sobre você':
          allFieldsComplete = isAboutComplete({ aboutYou: formData.sobre });
          // Permitir campo vazio (agora o backend aceita nulo)
          await updateUserAboutYou(formData.sobre?.trim() || '');
          break;
        case 'Habilidades':
          allFieldsComplete = isHabilitiesComplete({ habilities: formData.habilidades });
          // Permitir campo vazio (agora o backend aceita nulo)
          const habilitiesArray = formData.habilidades ? 
            formData.habilidades.split(',').map(h => h.trim()).filter(h => h) : [];
          await updateUserHabilities(habilitiesArray);
          break;
        case 'Momento de carreira':
          allFieldsComplete = isCareerComplete({ momentCareer: formData.carreira });
          // Permitir campo vazio (agora o backend aceita nulo)
          const momentCareerValue = formData.carreira?.trim() || '';
          await updateUserMomentCareer(momentCareerValue === '' ? null : momentCareerValue);
          break;
      }

      // Só atualizar notificações se todos os campos foram preenchidos
      if (allFieldsComplete) {
        await updateNotificationsAfterChange();
      }
    } catch (error) {
    } finally {
      handleModalClose();
    }
  }, [selectedTask, formData, userProfile, updateUserName, updateUserAge, updateUserLinks, updateUserAbout, handleModalClose, isBasicInfoComplete, isLinksComplete, isAboutComplete, isHabilitiesComplete, isCareerComplete, updateNotificationsAfterChange]);

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
      const allFieldsComplete = isBasicInfoComplete(basicInfoData);
      
      // Atualizar nome se mudou
      if (basicInfoData.nome && basicInfoData.nome !== userProfile.name) {
        await updateUserName(basicInfoData.nome);
      }
      
      // Atualizar outros campos básicos se necessário
      // Aqui você pode adicionar mais campos conforme necessário
      
      // Só atualizar notificações se todos os campos foram preenchidos
      if (allFieldsComplete) {
        await updateNotificationsAfterChange();
      }
    } catch (error) {
    } finally {
      setIsBasicInfoModalOpen(false);
    }
  }, [basicInfoData, userProfile, updateUserName, isBasicInfoComplete, updateNotificationsAfterChange]);

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
      const allFieldsComplete = isFocusComplete(selectedFocus, selectedContest, selectedCourse);
      
      const updateData: any = { userFocus: selectedFocus };

      if (selectedFocus === 'CONCURSO' && selectedContest) {
        updateData.contestType = selectedContest;
      }

      if (selectedFocus === 'FACULDADE' && selectedCourse) {
        updateData.collegeCourse = selectedCourse;
      }

      await updateUserProfile(updateData);
      
      // Só atualizar notificações se todos os campos foram preenchidos
      if (allFieldsComplete) {
        await updateNotificationsAfterChange();
      }
    } catch (error) {
    } finally {
      handleFocusModalClose();
    }
  }, [userProfile, selectedFocus, selectedContest, selectedCourse, updateUserProfile, handleFocusModalClose, isFocusComplete, updateNotificationsAfterChange]);

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
      const allFieldsComplete = isLinksComplete({
        linkedin: linksData.linkedin,
        github: linksData.github,
        portfolio: linksData.sitePessoal
      });
      
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
      }

      if (hasTwitterChange) {
        await updateTwitter(linksData.twitter);
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
        
        console.log('🔍 Debug - Ordem dos Links:');
        console.log('  - currentOrder (do drag):', currentOrder);
        console.log('  - completeOrder (filtrado):', completeOrder);
        console.log('  - missingFields:', missingFields);
        console.log('  - finalOrder (enviando):', finalOrder);
        
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
          console.log('📤 Enviando ordem para o backend:', finalOrder);
          const response = await updateSocialLinksOrder(finalOrder);
          console.log('📥 Resposta do backend:', response);
          
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
      
      // Só atualizar notificações se todos os campos foram preenchidos
      if (allFieldsComplete) {
        await updateNotificationsAfterChange();
      }
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
  }, [userProfile, linksData, linkFieldsOrder, updateUserLinks, updateInstagram, updateTwitter, updateSocialLinksOrder, isLinksComplete, updateNotificationsAfterChange]);

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
      const allFieldsComplete = isAboutComplete({ aboutYou: aboutText });
      
      // Permitir campo vazio (agora o backend aceita nulo)
      await updateUserAboutYou(aboutText?.trim() || '');
      
      // Só atualizar notificações se todos os campos foram preenchidos
      if (allFieldsComplete) {
        await updateNotificationsAfterChange();
      }
    } catch (error) {
      setError('Erro ao atualizar sobre você');
    } finally {
      handleAboutModalClose();
    }
  }, [userProfile, aboutText, updateUserAboutYou, handleAboutModalClose, isAboutComplete, updateNotificationsAfterChange]);

  const handleHabilitiesModalClose = useCallback(() => {
    setIsHabilitiesModalOpen(false);
  }, []);

  const handleHabilitiesSubmit = useCallback(async (habilities: string[]) => {
    try {
      await updateUserHabilities(habilities);
      await updateNotificationsAfterChange();
    } catch (error) {
      throw error;
    }
  }, [updateUserHabilities, updateNotificationsAfterChange]);

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
    setLinkFieldsOrder
  };
}
