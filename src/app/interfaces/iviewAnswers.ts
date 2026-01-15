// interfaces/iuser-answer.ts
export interface IUserAnswerView {
  questionId: number;
  questionText: string;
  writtenAnswer: string | null;
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