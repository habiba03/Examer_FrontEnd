export interface UserAnswerPayload {
  examSubmissionId: string;
  answers: {
    questionId: number;
    questionText: string;
    writtenAnswer?: string;
    selectedOptionIndexes?: number[];
  }[];
}
