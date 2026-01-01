
// export interface IquestionContentData {
//   "questionId":number,
//   "questionContent": "string",
//   "difficulty": "string",
//   "correctAnswer": "string",
//   "option1": "string",
//   "option2": "string",
//   "option3": "string",
//   "option4": "string"
// }

// export interface IOption {
//   id: number;
//   content: string;
// }

// export interface IquestionContentData {
//   questionId: number;
//   category: string;
//   difficulty: string;
//   questionContent: string;
//   questionType: 'MCQ' | 'TF' | 'WRITTEN';
//   options: IOption[] | null;
//   correctOptionIndexes: number[];
// }


export interface IquestionContentData {
  questionId: number;
  questionContent: string;
  category: string;
  difficulty: string;
  questionType: 'MCQ' | 'TF' | 'WRITTEN';
  options: string[];                // replaces option1–option4
  correctOptionIndexes: number[];    // indexes of correct options
}

export interface IquestionContent {
  content:IquestionContentData[],
  pageNumber:number,
  pageSize:number,
  totalElements:number,
  totalPages:number
}
export interface Iquestion {
  "message":string,
  "data":IquestionContent
}


