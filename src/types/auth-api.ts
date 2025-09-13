// DTOs de Autenticação
export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  educationLevel: EducationLevel;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RequestPasswordResetDto {
  email: string;
}

export interface VerifyResetCodeDto {
  email: string;
  code: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export type EducationLevel = 
  | 'FUNDAMENTAL' 
  | 'ENSINO_MEDIO' 
  | 'GRADUACAO' 
  | 'POS_GRADUACAO' 
  | 'MESTRADO' 
  | 'DOUTORADO';

// Respostas da API
export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  nome: string;
  email: string;
  age: number;
  educationLevel: EducationLevel;
  createdAt: string;
  updatedAt: string;
  perfil?: string;
  notification?: {
    hasNotification: boolean;
    missingFields: string[];
    message: string;
    badge: string | null;
  };
  userFocus?: string;
  contestType?: string;
  collegeCourse?: string;
}

export type UserFocus = 'ENEM' | 'CONCURSO' | 'FACULDADE' | 'ENSINO_MEDIO';

export type ContestType = 
  | 'PRF' | 'ESA' | 'DATAPREV' | 'POLICIA_CIVIL' | 'POLICIA_MILITAR' 
  | 'BOMBEIROS' | 'TJ' | 'MP' | 'TRF' | 'TRE' | 'TRT' | 'INSS' 
  | 'IBGE' | 'ANAC' | 'ANATEL' | 'BACEN' | 'CVM' | 'SUSEP' 
  | 'PREVIC' | 'OUTROS';

export type CollegeCourse = 
  | 'MEDICINA' | 'ENGENHARIA' | 'DIREITO' | 'ADMINISTRACAO' 
  | 'CONTABILIDADE' | 'PSICOLOGIA' | 'PEDAGOGIA' | 'ENFERMAGEM' 
  | 'FARMACIA' | 'FISIOTERAPIA' | 'ODONTOLOGIA' | 'VETERINARIA' 
  | 'ARQUITETURA' | 'CIENCIA_COMPUTACAO' | 'SISTEMAS_INFORMACAO' 
  | 'JORNALISMO' | 'PUBLICIDADE' | 'MARKETING' | 'ECONOMIA' 
  | 'RELACOES_INTERNACIONAIS' | 'OUTROS';

export interface ProfileUpdateDto {
  userFocus?: UserFocus;
  contestType?: ContestType;
  collegeCourse?: CollegeCourse;
}

export interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data?: T;
  timestamp: string;
}


// Mapeamento de níveis educacionais para português
export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  FUNDAMENTAL: 'Ensino Fundamental',
  ENSINO_MEDIO: 'Ensino Médio',
  GRADUACAO: 'Graduação',
  POS_GRADUACAO: 'Pós-Graduação',
  MESTRADO: 'Mestrado',
  DOUTORADO: 'Doutorado'
};

// Mapeamento de badges
export const BADGE_MAPPING: Record<string, string> = {
  // ENEM
  'ENEM': 'ENEM_BADGE',
  
  // CONCURSOS
  'PRF': 'PRF_BADGE',
  'ESA': 'ESA_BADGE',
  'DATAPREV': 'DATAPREV_BADGE',
  'POLICIA_CIVIL': 'POLICIA_CIVIL_BADGE',
  'POLICIA_MILITAR': 'POLICIA_MILITAR_BADGE',
  'BOMBEIROS': 'BOMBEIROS_BADGE',
  'TJ': 'TJ_BADGE',
  'MP': 'MP_BADGE',
  'TRF': 'TRF_BADGE',
  'TRE': 'TRE_BADGE',
  'TRT': 'TRT_BADGE',
  'INSS': 'INSS_BADGE',
  'IBGE': 'IBGE_BADGE',
  'ANAC': 'ANAC_BADGE',
  'ANATEL': 'ANATEL_BADGE',
  'BACEN': 'BACEN_BADGE',
  'CVM': 'CVM_BADGE',
  'SUSEP': 'SUSEP_BADGE',
  'PREVIC': 'PREVIC_BADGE',
  'OUTROS': 'OUTROS_BADGE',
  
  // CURSOS DE FACULDADE
  'MEDICINA': 'MEDICINA_BADGE',
  'ENGENHARIA': 'ENGENHARIA_BADGE',
  'DIREITO': 'DIREITO_BADGE',
  'ADMINISTRACAO': 'ADMINISTRACAO_BADGE',
  'CONTABILIDADE': 'CONTABILIDADE_BADGE',
  'PSICOLOGIA': 'PSICOLOGIA_BADGE',
  'PEDAGOGIA': 'PEDAGOGIA_BADGE',
  'ENFERMAGEM': 'ENFERMAGEM_BADGE',
  'FARMACIA': 'FARMACIA_BADGE',
  'FISIOTERAPIA': 'FISIOTERAPIA_BADGE',
  'ODONTOLOGIA': 'ODONTOLOGIA_BADGE',
  'VETERINARIA': 'VETERINARIA_BADGE',
  'ARQUITETURA': 'ARQUITETURA_BADGE',
  'CIENCIA_COMPUTACAO': 'CIENCIA_COMPUTACAO_BADGE',
  'SISTEMAS_INFORMACAO': 'SISTEMAS_INFORMACAO_BADGE',
  'JORNALISMO': 'JORNALISMO_BADGE',
  'PUBLICIDADE': 'PUBLICIDADE_BADGE',
  'MARKETING': 'MARKETING_BADGE',
  'ECONOMIA': 'ECONOMIA_BADGE',
  'RELACOES_INTERNACIONAIS': 'RELACOES_INTERNACIONAIS_BADGE',
  
  // ENSINO MÉDIO
  'ENSINO_MEDIO': 'ENSINO_MEDIO_BADGE'
};

// Labels para exibição
export const USER_FOCUS_LABELS: Record<UserFocus, string> = {
  ENEM: 'ENEM',
  CONCURSO: 'Concurso Público',
  FACULDADE: 'Faculdade',
  ENSINO_MEDIO: 'Ensino Médio'
};

export const CONTEST_TYPE_LABELS: Record<ContestType, string> = {
  PRF: 'Polícia Rodoviária Federal',
  ESA: 'Escola de Sargentos das Armas',
  DATAPREV: 'Dataprev',
  POLICIA_CIVIL: 'Polícia Civil',
  POLICIA_MILITAR: 'Polícia Militar',
  BOMBEIROS: 'Bombeiros',
  TJ: 'Tribunal de Justiça',
  MP: 'Ministério Público',
  TRF: 'Tribunal Regional Federal',
  TRE: 'Tribunal Regional Eleitoral',
  TRT: 'Tribunal Regional do Trabalho',
  INSS: 'Instituto Nacional do Seguro Social',
  IBGE: 'Instituto Brasileiro de Geografia e Estatística',
  ANAC: 'Agência Nacional de Aviação Civil',
  ANATEL: 'Agência Nacional de Telecomunicações',
  BACEN: 'Banco Central',
  CVM: 'Comissão de Valores Mobiliários',
  SUSEP: 'Superintendência de Seguros Privados',
  PREVIC: 'Superintendência Nacional de Previdência Complementar',
  OUTROS: 'Outros'
};

export const COLLEGE_COURSE_LABELS: Record<CollegeCourse, string> = {
  MEDICINA: 'Medicina',
  ENGENHARIA: 'Engenharia',
  DIREITO: 'Direito',
  ADMINISTRACAO: 'Administração',
  CONTABILIDADE: 'Contabilidade',
  PSICOLOGIA: 'Psicologia',
  PEDAGOGIA: 'Pedagogia',
  ENFERMAGEM: 'Enfermagem',
  FARMACIA: 'Farmácia',
  FISIOTERAPIA: 'Fisioterapia',
  ODONTOLOGIA: 'Odontologia',
  VETERINARIA: 'Veterinária',
  ARQUITETURA: 'Arquitetura',
  CIENCIA_COMPUTACAO: 'Ciência da Computação',
  SISTEMAS_INFORMACAO: 'Sistemas de Informação',
  JORNALISMO: 'Jornalismo',
  PUBLICIDADE: 'Publicidade',
  MARKETING: 'Marketing',
  ECONOMIA: 'Economia',
  RELACOES_INTERNACIONAIS: 'Relações Internacionais',
  OUTROS: 'Outros'
};
