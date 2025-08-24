import * as z from 'zod';
import { EducationLevel } from '@/types/education';
import { EDUCATION_LEVEL_MIN_AGE } from '@/lib/constants';

export const educationLevelSchema = z.nativeEnum(EducationLevel);

export const ageSchema = z.number()
  .min(0, 'Idade deve ser maior ou igual a 0')
  .max(120, 'Idade deve ser menor ou igual a 120');

export const ageWithEducationSchema = z.object({
  age: ageSchema,
  educationLevel: educationLevelSchema,
}).refine((data) => {
  const minAge = EDUCATION_LEVEL_MIN_AGE[data.educationLevel];
  return data.age >= minAge;
}, {
  message: 'Idade não é compatível com o nível de educação selecionado',
  path: ['age'],
});

export const validateAgeForEducation = (age: number, educationLevel: EducationLevel): boolean => {
  const minAge = EDUCATION_LEVEL_MIN_AGE[educationLevel];
  return age >= minAge;
};

export const getMinAgeForEducation = (educationLevel: EducationLevel): number => {
  return EDUCATION_LEVEL_MIN_AGE[educationLevel];
}; 
