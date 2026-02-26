import practicalWiringProblemsData from "@/data/practical-wiring-problems.json";
import practicalDefectQuestionsData from "@/data/practical-defect-questions.json";

export interface PracticalWiringProblem {
  id: number;
  title: string;
  focus: string;
  singleLineImage: string;
  steps: string[];
  tip: string;
}

export interface PracticalDefectQuestion {
  id: string;
  title: string;
  image?: string;
  hasDefect: boolean;
  defectType?: string;
  defectDescription?: string;
  judgingCriteria: string;
}

export function getPracticalWiringProblems(): PracticalWiringProblem[] {
  return practicalWiringProblemsData as PracticalWiringProblem[];
}

export function getPracticalDefectQuestions(): PracticalDefectQuestion[] {
  return practicalDefectQuestionsData as PracticalDefectQuestion[];
}
