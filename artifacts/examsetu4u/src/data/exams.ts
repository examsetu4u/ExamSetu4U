export type Exam = {
  id: string;
  name: string;
  shortDescription: string;
  subjects: string;
  tone: 'saffron' | 'teal' | 'blue' | 'coral';
};

export const exams: Exam[] = [
  { id: 'super-tet', name: 'Super TET', shortDescription: 'Prepare for teaching eligibility with focused practice and clear concepts.', subjects: 'Teaching · General Knowledge', tone: 'saffron' },
  { id: 'ctet', name: 'CTET', shortDescription: 'Build a steady foundation for the Central Teacher Eligibility Test.', subjects: 'CDP · Languages · EVS', tone: 'teal' },
  { id: 'uptet', name: 'UPTET', shortDescription: 'Revise the Uttar Pradesh TET syllabus with simple study paths.', subjects: 'Pedagogy · Hindi · Maths', tone: 'blue' },
  { id: 'ssc', name: 'SSC', shortDescription: 'Keep your SSC preparation organised across aptitude and reasoning.', subjects: 'Quant · Reasoning · English', tone: 'coral' },
];