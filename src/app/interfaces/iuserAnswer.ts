export interface UserAnswerPayload {
  examSubmissionId: string;
  answers: {
    questionId: number;
    writtenAnswer?: string;
    selectedOptionIndexes?: number[];
  }[];
}
