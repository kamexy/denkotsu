import type { Question } from "@/types";
import questionsData from "@/data/questions.json";

const questions: Question[] = questionsData as Question[];

export function getAllQuestions(): Question[] {
  return questions;
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

export function getQuestionsByCategory(category: string): Question[] {
  return questions.filter((q) => q.category === category);
}
