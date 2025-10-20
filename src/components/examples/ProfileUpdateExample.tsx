'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/features/useProfile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function ProfileUpdateExample() {
  const {
    userProfile,
    updateUserName,
    updateUserAge,
    updateUserProfileImage,
    updateUserLinks,
    updateUserAbout,
    updateUserProfile,
    refreshNotifications,
    isLoading
  } = useProfile();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [aboutYou, setAboutYou] = useState('');
  const [habilities, setHabilities] = useState('');
  const [momentCareer, setMomentCareer] = useState('');
  const [location, setLocation] = useState('');

  const handleUpdateName = async () => {
    if (name.trim()) {
      await updateUserName(name);
      setName('');
    }
  };

  const handleUpdateAge = async () => {
    const ageNumber = parseInt(age);
    if (!isNaN(ageNumber) && ageNumber > 0) {
      await updateUserAge(ageNumber);
      setAge('');
    }
  };

  const handleUpdateProfileImage = async () => {
    if (profileImage.trim()) {
      await updateUserProfileImage(profileImage);
      setProfileImage('');
    }
  };

  const handleUpdateLinks = async () => {
    await updateUserLinks({
      linkedin: linkedin || undefined,
      github: github || undefined,
      portfolio: portfolio || undefined
    });
    setLinkedin('');
    setGithub('');
    setPortfolio('');
  };

  const handleUpdateAbout = async () => {
    await updateUserAbout({
      aboutYou: aboutYou || undefined,
      habilities: habilities || undefined,
      momentCareer: momentCareer || undefined,
      location: location || undefined
    });
    setAboutYou('');
    setHabilities('');
    setMomentCareer('');
    setLocation('');
  };

  const handleUpdateFullProfile = async () => {
    await updateUserProfile({
      name: name || undefined,
      age: age ? parseInt(age) : undefined,
      profileImage: profileImage || undefined,
      linkedin: linkedin || undefined,
      github: github || undefined,
      portfolio: portfolio || undefined,
      aboutYou: aboutYou || undefined,
      habilities: habilities || undefined,
      momentCareer: momentCareer || undefined,
      location: location || undefined
    });
  };

  const handleRefreshNotifications = async () => {
    await refreshNotifications();
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Exemplo de Atualização de Perfil</h1>
      
      {/* Informações atuais */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Nome:</strong> {userProfile?.name}</p>
            <p><strong>Idade:</strong> {userProfile?.age}</p>
            <p><strong>Email:</strong> {typeof userProfile?.email === 'string' ? userProfile.email : userProfile?.email?.value}</p>
            <p><strong>LinkedIn:</strong> {userProfile?.linkedin || 'Não informado'}</p>
            <p><strong>GitHub:</strong> {userProfile?.github || 'Não informado'}</p>
            <p><strong>Portfolio:</strong> {userProfile?.portfolio || 'Não informado'}</p>
            <p><strong>Sobre você:</strong> {userProfile?.aboutYou || 'Não informado'}</p>
            <p><strong>Habilidades:</strong> {userProfile?.habilities || 'Não informado'}</p>
            <p><strong>Momento de carreira:</strong> {userProfile?.momentCareer || 'Não informado'}</p>
            <p><strong>Localização:</strong> {userProfile?.location || 'Não informado'}</p>
            <p><strong>Porcentagem de completude:</strong> {userProfile?.notification?.profileCompletionPercentage}%</p>
            <p><strong>Campos faltantes:</strong> {userProfile?.notification?.missingFields?.join(', ') || 'Nenhum'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Atualizações individuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atualizar Nome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Novo nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={handleUpdateName} disabled={!name.trim()}>
              Atualizar Nome
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atualizar Idade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Nova idade"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <Button onClick={handleUpdateAge} disabled={!age || isNaN(parseInt(age))}>
              Atualizar Idade
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atualizar Foto do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="URL da nova foto"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
            />
            <Button onClick={handleUpdateProfileImage} disabled={!profileImage.trim()}>
              Atualizar Foto
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atualizar Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="LinkedIn URL"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
            <Input
              placeholder="GitHub URL"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
            <Input
              placeholder="Portfolio URL"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
            />
            <Button onClick={handleUpdateLinks}>
              Atualizar Links
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atualizar Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Sobre você"
              value={aboutYou}
              onChange={(e) => setAboutYou(e.target.value)}
            />
            <Textarea
              placeholder="Habilidades"
              value={habilities}
              onChange={(e) => setHabilities(e.target.value)}
            />
            <Textarea
              placeholder="Momento de carreira"
              value={momentCareer}
              onChange={(e) => setMomentCareer(e.target.value)}
            />
            <Input
              placeholder="Localização"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Button onClick={handleUpdateAbout}>
              Atualizar Informações
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleUpdateFullProfile} className="w-full">
              Atualizar Perfil Completo
            </Button>
            <Button onClick={handleRefreshNotifications} variant="outline" className="w-full">
              Atualizar Notificações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
