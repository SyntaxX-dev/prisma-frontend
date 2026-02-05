export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  educationLevel: ApiEducationLevel;
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

export type ApiEducationLevel = 
  | 'FUNDAMENTAL' 
  | 'ENSINO_MEDIO' 
  | 'GRADUACAO' 
  | 'POS_GRADUACAO' 
  | 'MESTRADO' 
  | 'DOUTORADO';

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
  educationLevel: ApiEducationLevel;
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


export const EDUCATION_LEVEL_LABELS: Record<ApiEducationLevel, string> = {
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

  // Concursos - Policiais e Segurança
  'PF': 'PF_BADGE',
  'PRF': 'PRF_BADGE',
  'POLICIA_CIVIL': 'POLICIA_CIVIL_BADGE',
  'POLICIA_MILITAR': 'POLICIA_MILITAR_BADGE',
  'POLICIA_PENAL': 'POLICIA_PENAL_BADGE',
  'BOMBEIROS': 'BOMBEIROS_BADGE',
  // Concursos - Forças Armadas
  'EXERCITO': 'EXERCITO_BADGE',
  'MARINHA': 'MARINHA_BADGE',
  'AERONAUTICA': 'AERONAUTICA_BADGE',
  'ESA': 'ESA_BADGE',
  // Concursos - Fiscal e Financeiro
  'RECEITA_FEDERAL': 'RECEITA_FEDERAL_BADGE',
  'BACEN': 'BACEN_BADGE',
  'CGU': 'CGU_BADGE',
  'SEFAZ': 'SEFAZ_BADGE',
  // Concursos - Tribunais e Jurídico
  'TCU': 'TCU_BADGE',
  'TCE': 'TCE_BADGE',
  'STF': 'STF_BADGE',
  'STJ': 'STJ_BADGE',
  'TJ': 'TJ_BADGE',
  'TRF': 'TRF_BADGE',
  'TRE': 'TRE_BADGE',
  'TRT': 'TRT_BADGE',
  'MP': 'MP_BADGE',
  // Concursos - Bancos e Estatais
  'INSS': 'INSS_BADGE',
  'CAIXA': 'CAIXA_BADGE',
  'BB': 'BB_BADGE',
  'CORREIOS': 'CORREIOS_BADGE',
  'PETROBRAS': 'PETROBRAS_BADGE',
  // Concursos - Agências e Autarquias
  'IBGE': 'IBGE_BADGE',
  'DATAPREV': 'DATAPREV_BADGE',
  'ABIN': 'ABIN_BADGE',
  'ANAC': 'ANAC_BADGE',
  'ANATEL': 'ANATEL_BADGE',
  'CVM': 'CVM_BADGE',
  'SUSEP': 'SUSEP_BADGE',
  'PREVIC': 'PREVIC_BADGE',
  // Concursos - Municipal e Estadual
  'PREFEITURAS': 'PREFEITURAS_BADGE',
  'DETRAN': 'DETRAN_BADGE',
  'OUTROS': 'OUTROS_BADGE',

  // Faculdade - Saúde
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
  // Faculdade - Engenharias
  'ENGENHARIA_CIVIL': 'ENGENHARIA_CIVIL_BADGE',
  'ENGENHARIA_MECANICA': 'ENGENHARIA_MECANICA_BADGE',
  'ENGENHARIA_ELETRICA': 'ENGENHARIA_ELETRICA_BADGE',
  'ENGENHARIA_PRODUCAO': 'ENGENHARIA_PRODUCAO_BADGE',
  'ENGENHARIA_COMPUTACAO': 'ENGENHARIA_COMPUTACAO_BADGE',
  // Faculdade - Exatas e Tecnologia
  'CIENCIA_COMPUTACAO': 'CIENCIA_COMPUTACAO_BADGE',
  'SISTEMAS_INFORMACAO': 'SISTEMAS_INFORMACAO_BADGE',
  'ANALISE_DESENVOLVIMENTO_SISTEMAS': 'ANALISE_DESENVOLVIMENTO_SISTEMAS_BADGE',
  'MATEMATICA': 'MATEMATICA_BADGE',
  'FISICA': 'FISICA_BADGE',
  'QUIMICA': 'QUIMICA_BADGE',
  // Faculdade - Humanas e Sociais
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
  // Faculdade - Biológicas
  'BIOLOGIA': 'BIOLOGIA_BADGE',
  // Faculdade - Comunicação e Design
  'JORNALISMO': 'JORNALISMO_BADGE',
  'PUBLICIDADE': 'PUBLICIDADE_BADGE',
  'MARKETING': 'MARKETING_BADGE',
  'DESIGN': 'DESIGN_BADGE',
  // Faculdade - Outros
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
  // Policiais e Segurança Pública
  PF: 'Polícia Federal',
  PRF: 'Polícia Rodoviária Federal',
  POLICIA_CIVIL: 'Polícia Civil',
  POLICIA_MILITAR: 'Polícia Militar',
  POLICIA_PENAL: 'Polícia Penal',
  BOMBEIROS: 'Corpo de Bombeiros',
  // Forças Armadas
  EXERCITO: 'Exército Brasileiro',
  MARINHA: 'Marinha do Brasil',
  AERONAUTICA: 'Força Aérea Brasileira',
  ESA: 'Escola de Sargentos das Armas',
  // Fiscal e Financeiro
  RECEITA_FEDERAL: 'Receita Federal',
  BACEN: 'Banco Central',
  CGU: 'Controladoria-Geral da União',
  SEFAZ: 'Secretaria da Fazenda',
  // Tribunais e Jurídico
  TCU: 'Tribunal de Contas da União',
  TCE: 'Tribunal de Contas do Estado',
  STF: 'Supremo Tribunal Federal',
  STJ: 'Superior Tribunal de Justiça',
  TJ: 'Tribunal de Justiça',
  TRF: 'Tribunal Regional Federal',
  TRE: 'Tribunal Regional Eleitoral',
  TRT: 'Tribunal Regional do Trabalho',
  MP: 'Ministério Público',
  // Bancos e Estatais
  INSS: 'INSS',
  CAIXA: 'Caixa Econômica Federal',
  BB: 'Banco do Brasil',
  CORREIOS: 'Correios',
  PETROBRAS: 'Petrobras',
  // Agências e Autarquias
  IBGE: 'IBGE',
  DATAPREV: 'Dataprev',
  ABIN: 'Agência Brasileira de Inteligência',
  ANAC: 'ANAC',
  ANATEL: 'ANATEL',
  CVM: 'Comissão de Valores Mobiliários',
  SUSEP: 'SUSEP',
  PREVIC: 'PREVIC',
  // Municipal e Estadual
  PREFEITURAS: 'Prefeituras Municipais',
  DETRAN: 'Detran',
  OUTROS: 'Outros'
};

export const COLLEGE_COURSE_LABELS: Record<CollegeCourse, string> = {
  // Saúde
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
  // Engenharias
  ENGENHARIA_CIVIL: 'Engenharia Civil',
  ENGENHARIA_MECANICA: 'Engenharia Mecânica',
  ENGENHARIA_ELETRICA: 'Engenharia Elétrica',
  ENGENHARIA_PRODUCAO: 'Engenharia de Produção',
  ENGENHARIA_COMPUTACAO: 'Engenharia da Computação',
  // Exatas e Tecnologia
  CIENCIA_COMPUTACAO: 'Ciência da Computação',
  SISTEMAS_INFORMACAO: 'Sistemas de Informação',
  ANALISE_DESENVOLVIMENTO_SISTEMAS: 'Análise e Desenvolvimento de Sistemas',
  MATEMATICA: 'Matemática',
  FISICA: 'Física',
  QUIMICA: 'Química',
  // Humanas e Sociais
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
  // Biológicas
  BIOLOGIA: 'Ciências Biológicas',
  // Comunicação e Design
  JORNALISMO: 'Jornalismo',
  PUBLICIDADE: 'Publicidade e Propaganda',
  MARKETING: 'Marketing',
  DESIGN: 'Design',
  // Arquitetura
  ARQUITETURA: 'Arquitetura e Urbanismo',
  // Outros
  GASTRONOMIA: 'Gastronomia',
  OUTROS: 'Outros'
};
