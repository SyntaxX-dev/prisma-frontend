# Sistema de Invalidação de Cache - TanStack Query

## 📋 Visão Geral

O sistema de invalidação de cache permite gerenciar de forma centralizada quais queries do TanStack Query devem ser invalidadas quando dados são atualizados. Isso garante que a interface sempre mostre dados atualizados.

## ✅ Status de Implementação

**Já implementado e funcionando:**
- ✅ Sistema de invalidação de cache criado
- ✅ Hooks `useOffensives` e `useCourseSearch` usando tags de cache
- ✅ `StreakCalendar` usando invalidação ao clicar nas ofensivas
- ✅ Hook `useProfileQuery` criado para usar TanStack Query
- ✅ Exemplos práticos de uso criados

**Próximos passos:**
- 🔄 Migrar `useProfile` de `useState` para TanStack Query
- 🔄 Integrar invalidação em formulários de atualização
- 🔄 Adicionar invalidação automática em mutations

## 🏗️ Estrutura

```
src/
├── lib/cache/
│   └── invalidate-tags.ts          # Tags e funções de invalidação
├── hooks/
│   └── useCacheInvalidation.ts     # Hooks para componentes React
└── docs/
    └── cache-invalidation.md       # Esta documentação
```

## 🏷️ Tags de Cache

### **Tags Disponíveis**

```typescript
const CACHE_TAGS = {
  // Perfil
  PROFILE: 'profile',
  USER_PROFILE: 'user-profile',
  PROFILE_NOTIFICATIONS: 'profile-notifications',
  
  // Cursos
  COURSES: 'courses',
  COURSES_ALL: 'courses-all',
  COURSES_SEARCH: 'courses-search',
  
  // Ofensivas
  OFFENSIVES: 'offensives',
  STREAK: 'streak',
  
  // Vídeos
  VIDEOS: 'videos',
  VIDEOS_BY_GUIDE: 'videos-by-guide',
  VIDEOS_BY_MODULE: 'videos-by-module',
  VIDEOS_WITH_PROGRESS: 'videos-with-progress',
  
  // Módulos
  MODULES: 'modules',
  MODULES_BY_SUBCOURSE: 'modules-by-subcourse',
  
  // Guias
  GUIDES: 'guides',
  GUIDE_LEVELS: 'guide-levels',
  
  // Níveis
  LEVELS: 'levels',
  
  // Progresso
  PROGRESS: 'progress',
  USER_PROGRESS: 'user-progress',
  COURSE_PROGRESS: 'course-progress',
  
  // Opções
  OPTIONS: 'options',
  COLLEGE_COURSE_OPTIONS: 'college-course-options',
  CONTEST_OPTIONS: 'contest-options',
};
```

### **Grupos de Tags**

```typescript
const CACHE_TAG_GROUPS = {
  PROFILE_ALL: ['profile', 'user-profile', 'profile-notifications'],
  COURSES_ALL: ['courses', 'courses-all', 'courses-search'],
  OFFENSIVES_ALL: ['offensives', 'streak'],
  VIDEOS_ALL: ['videos', 'videos-by-guide', 'videos-by-module', 'videos-with-progress'],
  PROGRESS_ALL: ['progress', 'user-progress', 'course-progress'],
  OPTIONS_ALL: ['options', 'college-course-options', 'contest-options'],
};
```

## 🚀 Como Usar

### **1. Hook Principal**

```typescript
import { useCacheInvalidation } from '@/hooks/useCacheInvalidation';

function MyComponent() {
  const { invalidateTags, profile, courses, TAGS } = useCacheInvalidation();

  const handleUpdateProfile = async () => {
    // Atualizar dados...
    
    // Invalidar cache do perfil
    await profile();
    
    // Ou invalidar tags específicas
    await invalidateTags([TAGS.PROFILE, TAGS.USER_PROFILE]);
  };

  return (
    <button onClick={handleUpdateProfile}>
      Atualizar Perfil
    </button>
  );
}
```

### **2. Hooks Específicos**

```typescript
import { useProfileCacheInvalidation } from '@/hooks/useCacheInvalidation';

function ProfileComponent() {
  const { invalidateAll, invalidateBasic, invalidateNotifications } = useProfileCacheInvalidation();

  const handleUpdateBasicInfo = async () => {
    // Atualizar informações básicas...
    await invalidateBasic();
  };

  const handleUpdateNotifications = async () => {
    // Atualizar notificações...
    await invalidateNotifications();
  };

  return (
    <div>
      <button onClick={handleUpdateBasicInfo}>Atualizar Info Básica</button>
      <button onClick={handleUpdateNotifications}>Atualizar Notificações</button>
    </div>
  );
}
```

### **3. Uso Direto (Fora de Componentes)**

```typescript
import { invalidateCacheTags, CacheInvalidation } from '@/lib/cache/invalidate-tags';
import { queryClient } from '@/providers/QueryProvider';

// Invalidar tags específicas
await invalidateCacheTags(queryClient, ['profile', 'user-profile']);

// Usar funções específicas
await CacheInvalidation.invalidateProfile(queryClient);
await CacheInvalidation.invalidateCourses(queryClient);
```

## 🎯 Casos de Uso Comuns

### **1. Atualização de Perfil**

```typescript
const { profile } = useCacheInvalidation();

const updateUserProfile = async (data: ProfileData) => {
  try {
    await updateProfileAPI(data);
    await profile(); // Invalida todo o cache do perfil
    console.log('✅ Perfil atualizado e cache invalidado');
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
  }
};
```

### **2. Marcar Vídeo como Completo**

```typescript
const { progress, videos } = useCacheInvalidation();

const markVideoCompleted = async (videoId: string) => {
  try {
    await markVideoCompletedAPI(videoId);
    await progress(); // Invalida cache de progresso
    await videos();   // Invalida cache de vídeos
    console.log('✅ Vídeo marcado como completo');
  } catch (error) {
    console.error('❌ Erro ao marcar vídeo:', error);
  }
};
```

### **3. Busca de Cursos**

```typescript
const { courses } = useCacheInvalidation();

const searchCourses = async (query: string) => {
  try {
    await searchCoursesAPI(query);
    await courses(); // Invalida cache de cursos
    console.log('✅ Busca de cursos atualizada');
  } catch (error) {
    console.error('❌ Erro na busca:', error);
  }
};
```

### **4. Atualização de Ofensivas**

```typescript
const { offensives } = useCacheInvalidation();

const updateOffensives = async () => {
  try {
    await updateOffensivesAPI();
    await offensives(); // Invalida cache de ofensivas
    console.log('✅ Ofensivas atualizadas');
  } catch (error) {
    console.error('❌ Erro ao atualizar ofensivas:', error);
  }
};
```

## 🔧 Configurações Avançadas

### **Opções de Invalidação**

```typescript
const { invalidateTags } = useCacheInvalidation();

// Invalidar apenas queries ativas
await invalidateTags(['profile'], {
  refetchType: 'active'
});

// Invalidar queries exatas
await invalidateTags(['profile'], {
  exact: true
});

// Invalidar todas as queries (ativas e inativas)
await invalidateTags(['profile'], {
  refetchType: 'all'
});
```

### **Invalidação por ID**

```typescript
const { byId, TAGS } = useCacheInvalidation();

// Invalidar vídeo específico
await byId(TAGS.VIDEOS, 'video-123');

// Invalidar curso específico
await byId(TAGS.COURSES, 'course-456');
```

### **Remoção de Cache**

```typescript
const { removeQueries, clearAll } = useCacheInvalidation();

// Remover queries específicas do cache
await removeQueries(['profile', 'user-profile']);

// Limpar todo o cache
await clearAll();
```

## 📊 Logs de Debug

O sistema inclui logs detalhados para debug:

```javascript
// Logs esperados no console:
🔄 Invalidando tags de cache: ['profile', 'user-profile']
🔄 Invalidando grupos de cache: ['PROFILE_ALL'] Tags: ['profile', 'user-profile', 'profile-notifications']
🗑️ Removendo queries do cache: ['profile']
🗑️ Limpando todo o cache
```

## 🎨 Integração com Hooks Existentes

### **Atualizar Hooks para Usar Invalidação**

```typescript
// useProfile.ts
import { useCacheInvalidation } from '@/hooks/useCacheInvalidation';

export function useProfile() {
  const { profile } = useCacheInvalidation();
  
  const updateUserName = useCallback(async (name: string) => {
    try {
      await updateName(name);
      await profile(); // Invalida cache após atualização
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
    }
  }, [profile]);
  
  // ... resto do hook
}
```

### **Atualizar APIs para Usar Invalidação**

```typescript
// api/profile/update-profile.ts
import { queryClient } from '@/providers/QueryProvider';
import { CacheInvalidation } from '@/lib/cache/invalidate-tags';

export async function updateProfile(data: UpdateProfileRequest) {
  try {
    const response = await httpClient.put('/profile', data);
    
    // Invalidar cache após atualização bem-sucedida
    await CacheInvalidation.invalidateProfile(queryClient);
    
    return response;
  } catch (error) {
    throw error;
  }
}
```

## 🚨 Boas Práticas

### **1. Invalidar Após Mutations**
```typescript
const mutation = useMutation({
  mutationFn: updateProfile,
  onSuccess: () => {
    // Sempre invalidar cache após mutation bem-sucedida
    profile();
  },
});
```

### **2. Usar Grupos Quando Apropriado**
```typescript
// ✅ Bom: Usar grupo para invalidar tudo relacionado
await invalidateGroups(['PROFILE_ALL']);

// ❌ Evitar: Invalidar tags individuais quando há grupo
await invalidateTags(['profile', 'user-profile', 'profile-notifications']);
```

### **3. Invalidar Apenas o Necessário**
```typescript
// ✅ Bom: Invalidar apenas o que mudou
await invalidateTags([TAGS.USER_PROFILE]);

// ❌ Evitar: Invalidar tudo desnecessariamente
await invalidateAll();
```

### **4. Tratar Erros**
```typescript
const handleUpdate = async () => {
  try {
    await updateData();
    await profile();
  } catch (error) {
    console.error('Erro na atualização:', error);
    // Não invalidar cache se a atualização falhou
  }
};
```

## 🔄 Migração

### **Antes (Sem Sistema Centralizado)**
```typescript
// ❌ Invalidação manual e inconsistente
const queryClient = useQueryClient();
await queryClient.invalidateQueries(['profile']);
await queryClient.invalidateQueries(['user-profile']);
```

### **Depois (Com Sistema Centralizado)**
```typescript
// ✅ Invalidação centralizada e consistente
const { profile } = useCacheInvalidation();
await profile();
```

---

**Este sistema garante que o cache seja sempre atualizado de forma consistente e eficiente em toda a aplicação.**
