import { EducationLevel } from '@/types/education';

export const EDUCATION_OPTIONS = [
  {
    value: EducationLevel.ELEMENTARY,
    label: 'Ensino Fundamental',
    description: 'Educação básica fundamental'
  },
  {
    value: EducationLevel.HIGH_SCHOOL,
    label: 'Ensino Médio',
    description: 'Educação básica média'
  },
  {
    value: EducationLevel.UNDERGRADUATE,
    label: 'Graduação',
    description: 'Ensino superior - Bacharelado/Licenciatura'
  },
  {
    value: EducationLevel.POSTGRADUATE,
    label: 'Pós-Graduação',
    description: 'Especialização e MBA'
  },
  {
    value: EducationLevel.MASTER,
    label: 'Mestrado',
    description: 'Mestrado acadêmico ou profissional'
  },
  {
    value: EducationLevel.DOCTORATE,
    label: 'Doutorado',
    description: 'Doutorado acadêmico'
  }
];

export const EDUCATION_LEVEL_MIN_AGE = {
  [EducationLevel.ELEMENTARY]: 6,
  [EducationLevel.HIGH_SCHOOL]: 15,
  [EducationLevel.UNDERGRADUATE]: 18,
  [EducationLevel.POSTGRADUATE]: 22,
  [EducationLevel.MASTER]: 24,
  [EducationLevel.DOCTORATE]: 26,
}; 
