# Integração com API de Perfil

Este documento descreve como usar as novas integrações com a API de gerenciamento de perfil.

## Endpoints Implementados

### 1. Atualização de Nome
```typescript
import { updateName } from '@/api/profile';

await updateName({ name: 'João Silva' });
```

### 2. Atualização de Idade
```typescript
import { updateAge } from '@/api/profile';

await updateAge({ age: 25 });
```

### 3. Atualização de Foto do Perfil
```typescript
import { updateProfileImage } from '@/api/profile';

await updateProfileImage({ profileImage: 'https://exemplo.com/foto.jpg' });
```

### 4. Atualização de Links
```typescript
import { updateLinks } from '@/api/profile';

await updateLinks({
  linkedin: 'https://linkedin.com/in/joao',
  github: 'https://github.com/joao',
  portfolio: 'https://joao.dev'
});
```

### 5. Atualização de Informações Pessoais
```typescript
import { updateAbout } from '@/api/profile';

await updateAbout({
  aboutYou: 'Desenvolvedor apaixonado por tecnologia',
  habilities: 'JavaScript, React, Node.js',
  momentCareer: 'Iniciando carreira em desenvolvimento',
  location: 'São Paulo, SP'
});
```

### 6. Atualização Completa do Perfil
```typescript
import { updateProfile } from '@/api/profile';

await updateProfile({
  name: 'João Silva',
  age: 25,
  educationLevel: 'HIGH_SCHOOL',
  userFocus: 'ENEM',
  profileImage: 'https://exemplo.com/foto.jpg',
  linkedin: 'https://linkedin.com/in/joao',
  github: 'https://github.com/joao',
  portfolio: 'https://joao.dev',
  aboutYou: 'Desenvolvedor apaixonado por tecnologia',
  habilities: 'JavaScript, React, Node.js',
  momentCareer: 'Iniciando carreira em desenvolvimento',
  location: 'São Paulo, SP'
});
```

### 7. Obter Notificações
```typescript
import { getNotifications } from '@/api/profile';

const notifications = await getNotifications();
```

## Hook useProfile Atualizado

O hook `useProfile` agora inclui funções para todas as atualizações:

```typescript
import { useProfile } from '@/hooks/features/useProfile';

function MeuComponente() {
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

  const handleUpdateName = async () => {
    await updateUserName('Novo Nome');
  };

  return (
    <div>
      <p>Nome: {userProfile?.name}</p>
      <button onClick={handleUpdateName}>
        Atualizar Nome
      </button>
    </div>
  );
}
```

## Estrutura de Resposta da API

### Resposta de Sucesso
```typescript
{
  success: true,
  message: "Dados atualizados com sucesso",
  data: {
    // Dados atualizados
  }
}
```

### Resposta de Erro
```typescript
{
  success: false,
  message: "Erro específico",
  statusCode: 400
}
```

## Validações

### Nome
- **Tipo**: string
- **Obrigatório**: sim
- **Tamanho**: 2-100 caracteres
- **Único**: sim (deve ser único na plataforma)

### Idade
- **Tipo**: number
- **Obrigatório**: sim
- **Range**: 1-120 anos

### Email
- **Editável**: não
- **Tag**: READONLY_FIELD
- **Descrição**: Email não pode ser editado após o registro

### URLs (LinkedIn, GitHub, Portfolio)
- **Tipo**: string
- **Obrigatório**: não
- **Formato**: URL válida

## Códigos de Erro

- **400**: Bad Request - Dados inválidos
- **401**: Unauthorized - Token inválido ou ausente
- **403**: Forbidden - Campo não editável (ex: email)
- **404**: Not Found - Usuário não encontrado
- **409**: Conflict - Nome já existe na plataforma
- **500**: Internal Server Error - Erro interno do servidor

## Exemplo de Uso Completo

```typescript
import { useProfile } from '@/hooks/features/useProfile';
import { useState } from 'react';

function ProfileForm() {
  const { updateUserProfile, userProfile, isLoading } = useProfile();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    aboutYou: '',
    habilities: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateUserProfile({
        name: formData.name,
        age: parseInt(formData.age),
        aboutYou: formData.aboutYou,
        habilities: formData.habilities
      });
      
      // Sucesso - o hook já recarrega o perfil automaticamente
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil');
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
      />
      <input
        type="number"
        placeholder="Idade"
        value={formData.age}
        onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
      />
      <textarea
        placeholder="Sobre você"
        value={formData.aboutYou}
        onChange={(e) => setFormData(prev => ({ ...prev, aboutYou: e.target.value }))}
      />
      <textarea
        placeholder="Habilidades"
        value={formData.habilities}
        onChange={(e) => setFormData(prev => ({ ...prev, habilities: e.target.value }))}
      />
      <button type="submit">Atualizar Perfil</button>
    </form>
  );
}
```

## Notificações de Perfil

As notificações são automaticamente atualizadas após cada atualização de perfil. O sistema calcula:

- **Porcentagem de completude**: Baseada nos campos preenchidos
- **Campos faltantes**: Lista dos campos que ainda precisam ser preenchidos
- **Mensagem personalizada**: Sugestão de próximos passos

### Estrutura da Notificação
```typescript
{
  hasNotification: boolean;
  missingFields: string[];
  message: string;
  badge: string | null;
  profileCompletionPercentage: number;
  completedFields: string[];
}
```

## Tratamento de Erros

Todas as funções de atualização incluem tratamento de erro e recarregam automaticamente o perfil após sucesso:

```typescript
const updateUserName = useCallback(async (name: string) => {
  try {
    await updateName({ name });
    await loadUserProfile(); // Recarregar perfil após atualização
  } catch (error) {
    console.error('Erro ao atualizar nome:', error);
    setError('Erro ao atualizar nome');
  }
}, [loadUserProfile]);
```
