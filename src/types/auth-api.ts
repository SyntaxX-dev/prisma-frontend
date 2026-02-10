export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  educationLevel: EducationLevel;
  token?: string; // Token de registro (obrigatório para registro pago)
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

export interface AuthResponse {
  accessToken?: string;
  token?: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string | {
    value: string;
    readonly: boolean;
    tag: string;
  };
  perfil?: string;
  age?: number | null;
  educationLevel?: EducationLevel;
  profileImage?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  socialLinksOrder?: string[];
  aboutYou?: string | null;
  habilities?: string | null;
  momentCareer?: string | null;
  location?: string | null;
  locationVisibility?: 'PUBLIC' | 'STATE_ONLY' | 'PRIVATE';
  userFocus?: string | null;
  contestType?: string | null;
  collegeCourse?: string | null;
  badge?: string | null;
  isProfileComplete?: boolean;
  notification?: {
    hasNotification: boolean;
    missingFields: string[];
    message: string;
    badge?: string | null;
    profileCompletionPercentage: number;
    completedFields: string[];
  };
  createdAt?: string;
  updatedAt?: string;
  isFriend?: boolean;
}

export type UserFocus = 'ENEM' | 'CONCURSO' | 'FACULDADE' | 'ENSINO_MEDIO';

export type ContestType =
  | 'PF' | 'PRF' | 'POLICIA_CIVIL' | 'POLICIA_MILITAR' | 'POLICIA_PENAL'
  | 'BOMBEIROS' | 'EXERCITO' | 'MARINHA' | 'AERONAUTICA' | 'ESA'
  | 'RECEITA_FEDERAL' | 'BACEN' | 'CGU' | 'TCU' | 'TCE'
  | 'STF' | 'STJ' | 'TJ' | 'TRF' | 'TRE' | 'TRT' | 'MP'
  | 'INSS' | 'CAIXA' | 'BB' | 'CORREIOS' | 'PETROBRAS'
  | 'SEFAZ' | 'IBGE' | 'DATAPREV' | 'ABIN'
  | 'ANAC' | 'ANATEL' | 'CVM' | 'SUSEP' | 'PREVIC'
  | 'PREFEITURAS' | 'DETRAN' | 'OUTROS';

export type CollegeCourse =
  | 'MEDICINA' | 'DIREITO' | 'ENGENHARIA_CIVIL' | 'ENGENHARIA_MECANICA'
  | 'ENGENHARIA_ELETRICA' | 'ENGENHARIA_PRODUCAO' | 'ENGENHARIA_COMPUTACAO'
  | 'ADMINISTRACAO' | 'CONTABILIDADE' | 'ECONOMIA' | 'CIENCIA_COMPUTACAO'
  | 'SISTEMAS_INFORMACAO' | 'ANALISE_DESENVOLVIMENTO_SISTEMAS'
  | 'PSICOLOGIA' | 'PEDAGOGIA' | 'ENFERMAGEM' | 'FARMACIA'
  | 'FISIOTERAPIA' | 'ODONTOLOGIA' | 'VETERINARIA' | 'BIOMEDICINA'
  | 'NUTRICAO' | 'EDUCACAO_FISICA' | 'FONOAUDIOLOGIA'
  | 'ARQUITETURA' | 'DESIGN' | 'BIOLOGIA' | 'MATEMATICA'
  | 'FISICA' | 'QUIMICA' | 'LETRAS' | 'HISTORIA' | 'GEOGRAFIA'
  | 'FILOSOFIA' | 'CIENCIAS_SOCIAIS' | 'SERVICO_SOCIAL'
  | 'JORNALISMO' | 'PUBLICIDADE' | 'MARKETING'
  | 'RELACOES_INTERNACIONAIS' | 'GASTRONOMIA' | 'OUTROS';

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


export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  FUNDAMENTAL: 'Ensino Fundamental',
  ENSINO_MEDIO: 'Ensino Médio',
  GRADUACAO: 'Graduação',
  POS_GRADUACAO: 'Pós-Graduação',
  MESTRADO: 'Mestrado',
  DOUTORADO: 'Doutorado'
};

export const BADGE_MAPPING: Record<string, string> = {
  'ENEM': 'ENEM_BADGE',
  'ENSINO_MEDIO': 'ENSINO_MEDIO_BADGE',

  'PF': 'PF_BADGE',
  'PRF': 'PRF_BADGE',
  'POLICIA_CIVIL': 'POLICIA_CIVIL_BADGE',
  'POLICIA_MILITAR': 'POLICIA_MILITAR_BADGE',
  'POLICIA_PENAL': 'POLICIA_PENAL_BADGE',
  'BOMBEIROS': 'BOMBEIROS_BADGE',
  'EXERCITO': 'EXERCITO_BADGE',
  'MARINHA': 'MARINHA_BADGE',
  'AERONAUTICA': 'AERONAUTICA_BADGE',
  'ESA': 'ESA_BADGE',
  'RECEITA_FEDERAL': 'RECEITA_FEDERAL_BADGE',
  'BACEN': 'BACEN_BADGE',
  'CGU': 'CGU_BADGE',
  'SEFAZ': 'SEFAZ_BADGE',
  'TCU': 'TCU_BADGE',
  'TCE': 'TCE_BADGE',
  'STF': 'STF_BADGE',
  'STJ': 'STJ_BADGE',
  'TJ': 'TJ_BADGE',
  'TRF': 'TRF_BADGE',
  'TRE': 'TRE_BADGE',
  'TRT': 'TRT_BADGE',
  'MP': 'MP_BADGE',
  'INSS': 'INSS_BADGE',
  'CAIXA': 'CAIXA_BADGE',
  'BB': 'BB_BADGE',
  'CORREIOS': 'CORREIOS_BADGE',
  'PETROBRAS': 'PETROBRAS_BADGE',
  'IBGE': 'IBGE_BADGE',
  'DATAPREV': 'DATAPREV_BADGE',
  'ABIN': 'ABIN_BADGE',
  'ANAC': 'ANAC_BADGE',
  'ANATEL': 'ANATEL_BADGE',
  'CVM': 'CVM_BADGE',
  'SUSEP': 'SUSEP_BADGE',
  'PREVIC': 'PREVIC_BADGE',
  'PREFEITURAS': 'PREFEITURAS_BADGE',
  'DETRAN': 'DETRAN_BADGE',
  'OUTROS': 'OUTROS_BADGE',

  'MEDICINA': 'MEDICINA_BADGE',
  'ENFERMAGEM': 'ENFERMAGEM_BADGE',
  'FARMACIA': 'FARMACIA_BADGE',
  'ODONTOLOGIA': 'ODONTOLOGIA_BADGE',
  'FISIOTERAPIA': 'FISIOTERAPIA_BADGE',
  'VETERINARIA': 'VETERINARIA_BADGE',
  'BIOMEDICINA': 'BIOMEDICINA_BADGE',
  'NUTRICAO': 'NUTRICAO_BADGE',
  'EDUCACAO_FISICA': 'EDUCACAO_FISICA_BADGE',
  'FONOAUDIOLOGIA': 'FONOAUDIOLOGIA_BADGE',
  'PSICOLOGIA': 'PSICOLOGIA_BADGE',
  'ENGENHARIA_CIVIL': 'ENGENHARIA_CIVIL_BADGE',
  'ENGENHARIA_MECANICA': 'ENGENHARIA_MECANICA_BADGE',
  'ENGENHARIA_ELETRICA': 'ENGENHARIA_ELETRICA_BADGE',
  'ENGENHARIA_PRODUCAO': 'ENGENHARIA_PRODUCAO_BADGE',
  'ENGENHARIA_COMPUTACAO': 'ENGENHARIA_COMPUTACAO_BADGE',
  'CIENCIA_COMPUTACAO': 'CIENCIA_COMPUTACAO_BADGE',
  'SISTEMAS_INFORMACAO': 'SISTEMAS_INFORMACAO_BADGE',
  'ANALISE_DESENVOLVIMENTO_SISTEMAS': 'ANALISE_DESENVOLVIMENTO_SISTEMAS_BADGE',
  'MATEMATICA': 'MATEMATICA_BADGE',
  'FISICA': 'FISICA_BADGE',
  'QUIMICA': 'QUIMICA_BADGE',
  'DIREITO': 'DIREITO_BADGE',
  'ADMINISTRACAO': 'ADMINISTRACAO_BADGE',
  'CONTABILIDADE': 'CONTABILIDADE_BADGE',
  'ECONOMIA': 'ECONOMIA_BADGE',
  'PEDAGOGIA': 'PEDAGOGIA_BADGE',
  'LETRAS': 'LETRAS_BADGE',
  'HISTORIA': 'HISTORIA_BADGE',
  'GEOGRAFIA': 'GEOGRAFIA_BADGE',
  'FILOSOFIA': 'FILOSOFIA_BADGE',
  'CIENCIAS_SOCIAIS': 'CIENCIAS_SOCIAIS_BADGE',
  'SERVICO_SOCIAL': 'SERVICO_SOCIAL_BADGE',
  'RELACOES_INTERNACIONAIS': 'RELACOES_INTERNACIONAIS_BADGE',
  'BIOLOGIA': 'BIOLOGIA_BADGE',
  'JORNALISMO': 'JORNALISMO_BADGE',
  'PUBLICIDADE': 'PUBLICIDADE_BADGE',
  'MARKETING': 'MARKETING_BADGE',
  'DESIGN': 'DESIGN_BADGE',
  'ARQUITETURA': 'ARQUITETURA_BADGE',
  'GASTRONOMIA': 'GASTRONOMIA_BADGE'
};

export const USER_FOCUS_LABELS: Record<UserFocus, string> = {
  ENEM: 'ENEM',
  CONCURSO: 'Concurso Público',
  FACULDADE: 'Faculdade',
  ENSINO_MEDIO: 'Ensino Médio'
};

export const CONTEST_TYPE_LABELS: Record<ContestType, string> = {
  PF: 'Polícia Federal',
  PRF: 'Polícia Rodoviária Federal',
  POLICIA_CIVIL: 'Polícia Civil',
  POLICIA_MILITAR: 'Polícia Militar',
  POLICIA_PENAL: 'Polícia Penal',
  BOMBEIROS: 'Corpo de Bombeiros',
  EXERCITO: 'Exército Brasileiro',
  MARINHA: 'Marinha do Brasil',
  AERONAUTICA: 'Força Aérea Brasileira',
  ESA: 'Escola de Sargentos das Armas',
  RECEITA_FEDERAL: 'Receita Federal',
  BACEN: 'Banco Central',
  CGU: 'Controladoria-Geral da União',
  SEFAZ: 'Secretaria da Fazenda',
  TCU: 'Tribunal de Contas da União',
  TCE: 'Tribunal de Contas do Estado',
  STF: 'Supremo Tribunal Federal',
  STJ: 'Superior Tribunal de Justiça',
  TJ: 'Tribunal de Justiça',
  TRF: 'Tribunal Regional Federal',
  TRE: 'Tribunal Regional Eleitoral',
  TRT: 'Tribunal Regional do Trabalho',
  MP: 'Ministério Público',
  INSS: 'INSS',
  CAIXA: 'Caixa Econômica Federal',
  BB: 'Banco do Brasil',
  CORREIOS: 'Correios',
  PETROBRAS: 'Petrobras',
  IBGE: 'IBGE',
  DATAPREV: 'Dataprev',
  ABIN: 'Agência Brasileira de Inteligência',
  ANAC: 'ANAC',
  ANATEL: 'ANATEL',
  CVM: 'Comissão de Valores Mobiliários',
  SUSEP: 'SUSEP',
  PREVIC: 'PREVIC',
  PREFEITURAS: 'Prefeituras Municipais',
  DETRAN: 'Detran',
  OUTROS: 'Outros'
};

export const COLLEGE_COURSE_LABELS: Record<CollegeCourse, string> = {
  MEDICINA: 'Medicina',
  ENFERMAGEM: 'Enfermagem',
  FARMACIA: 'Farmácia',
  ODONTOLOGIA: 'Odontologia',
  FISIOTERAPIA: 'Fisioterapia',
  VETERINARIA: 'Medicina Veterinária',
  BIOMEDICINA: 'Biomedicina',
  NUTRICAO: 'Nutrição',
  EDUCACAO_FISICA: 'Educação Física',
  FONOAUDIOLOGIA: 'Fonoaudiologia',
  PSICOLOGIA: 'Psicologia',
  ENGENHARIA_CIVIL: 'Engenharia Civil',
  ENGENHARIA_MECANICA: 'Engenharia Mecânica',
  ENGENHARIA_ELETRICA: 'Engenharia Elétrica',
  ENGENHARIA_PRODUCAO: 'Engenharia de Produção',
  ENGENHARIA_COMPUTACAO: 'Engenharia da Computação',
  CIENCIA_COMPUTACAO: 'Ciência da Computação',
  SISTEMAS_INFORMACAO: 'Sistemas de Informação',
  ANALISE_DESENVOLVIMENTO_SISTEMAS: 'Análise e Desenvolvimento de Sistemas',
  MATEMATICA: 'Matemática',
  FISICA: 'Física',
  QUIMICA: 'Química',
  DIREITO: 'Direito',
  ADMINISTRACAO: 'Administração',
  CONTABILIDADE: 'Ciências Contábeis',
  ECONOMIA: 'Economia',
  PEDAGOGIA: 'Pedagogia',
  LETRAS: 'Letras',
  HISTORIA: 'História',
  GEOGRAFIA: 'Geografia',
  FILOSOFIA: 'Filosofia',
  CIENCIAS_SOCIAIS: 'Ciências Sociais',
  SERVICO_SOCIAL: 'Serviço Social',
  RELACOES_INTERNACIONAIS: 'Relações Internacionais',
  BIOLOGIA: 'Ciências Biológicas',
  JORNALISMO: 'Jornalismo',
  PUBLICIDADE: 'Publicidade e Propaganda',
  MARKETING: 'Marketing',
  DESIGN: 'Design',
  ARQUITETURA: 'Arquitetura e Urbanismo',
  GASTRONOMIA: 'Gastronomia',
  OUTROS: 'Outros'
};
