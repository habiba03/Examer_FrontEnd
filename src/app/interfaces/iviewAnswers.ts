// interfaces/iuser-answer.ts
export interface IUserAnswerView {
  userAnswerId: number; 
  questionId: number;
  questionText: string;
  writtenAnswer: string | null;
  writtenScore?: number;
  selectedOptions: ISelectedOption[];
  questionType?: 'MCQ' | 'TF' | 'WRITTEN'; // We'll determine this
}

export interface ISelectedOption {
  optionId: number;
  optionText: string;
  isCorrect: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}