import { UserProfile } from '@/types/api/auth-api';

export interface ProfileTask {
  label: string;
  completed: boolean;
}

export interface BasicInfoData {
  nome: string;
  areaAtuacao: string;
  empresa: string;
  nacionalidade: string;
  cidade: string;
}

export interface LinksData {
  sitePessoal: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  github: string;
}

export interface LinkField {
  id: string;
  field: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
}

export interface ModalField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'url' | 'textarea' | 'file';
}

export interface ProfilePageProps {
  user?: UserProfile;
  onGoBack?: () => void;
}

export interface ProfileHeaderProps {
  user: UserProfile;
  avatarImage: string | null;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getInitials: (user: UserProfile) => string;
}

export interface ProfileCompletionProps {
  profileTasks: ProfileTask[];
  completionPercentage: number;
  completedTasks: number;
  totalTasks: number;
  onTaskClick: (taskLabel: string) => void;
}

export interface ProfileLinksProps {
  onEditLinks: () => void;
}

export interface ProfileBadgesProps {
  badges: Array<{
    id: string;
    label: string;
    color: string;
  }>;
}

export interface ProfileAboutProps {
  aboutText: string;
  onEditAbout: () => void;
}

export interface ProfileHighlightsProps {
  onAddHighlight: () => void;
}

export interface BasicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  basicInfoData: BasicInfoData;
  onBasicInfoChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface FocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFocus: string;
  selectedCourse: string;
  selectedContest: string;
  onFocusSelect: (focus: string) => void;
  onCourseChange: (course: string) => void;
  onContestChange: (contest: string) => void;
  onSubmit: () => void;
}

export interface LinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  linksData: LinksData;
  linkFieldsOrder: LinkField[];
  onLinksChange: (field: string, value: string) => void;
  onDragEnd: (event: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  aboutText: string;
  onAboutChange: (text: string) => void;
  onSubmit: () => void;
}

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTask: string | null;
  formData: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  getModalFields: (taskLabel: string) => ModalField[];
}
