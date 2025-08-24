export enum EducationLevel {
  ELEMENTARY = 'ELEMENTARY',
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  UNDERGRADUATE = 'UNDERGRADUATE',
  POSTGRADUATE = 'POSTGRADUATE',
  MASTER = 'MASTER',
  DOCTORATE = 'DOCTORATE',
}

export const educationLevelPtToEn: Record<string, EducationLevel> = {
  FUNDAMENTAL: EducationLevel.ELEMENTARY,
  ENSINO_MEDIO: EducationLevel.HIGH_SCHOOL,
  GRADUACAO: EducationLevel.UNDERGRADUATE,
  POS_GRADUACAO: EducationLevel.POSTGRADUATE,
  MESTRADO: EducationLevel.MASTER,
  DOUTORADO: EducationLevel.DOCTORATE,
};

export const educationLevelEnToPt: Record<EducationLevel, string> = {
  [EducationLevel.ELEMENTARY]: 'FUNDAMENTAL',
  [EducationLevel.HIGH_SCHOOL]: 'ENSINO_MEDIO',
  [EducationLevel.UNDERGRADUATE]: 'GRADUACAO',
  [EducationLevel.POSTGRADUATE]: 'POS_GRADUACAO',
  [EducationLevel.MASTER]: 'MESTRADO',
  [EducationLevel.DOCTORATE]: 'DOUTORADO',
};

export const educationLevelLabels: Record<EducationLevel, string> = {
  [EducationLevel.ELEMENTARY]: 'Ensino Fundamental',
  [EducationLevel.HIGH_SCHOOL]: 'Ensino Médio',
  [EducationLevel.UNDERGRADUATE]: 'Graduação',
  [EducationLevel.POSTGRADUATE]: 'Pós-Graduação',
  [EducationLevel.MASTER]: 'Mestrado',
  [EducationLevel.DOCTORATE]: 'Doutorado',
}; 
