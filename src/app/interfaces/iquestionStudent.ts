export interface ExamQuestionContentData {
  questionId: number;
  questionContent: string;
  questionType: 'MCQ' | 'TF' | 'WRITTEN';
  options: string[] | null;
  correctOptionIndexes: number[];
}


export interface ExamQuestionConten {
  content:ExamQuestionContentData[],
  pageNumber:number,
  pageSize:number,
  totalElements:number,
  totalPages:number
}
export interface ExamQuestion {
  "message":string,
  "data":ExamQuestionConten
}