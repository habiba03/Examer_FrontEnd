
export interface IexamContentData {
  "examId": number,
  "examTitle": "string",
  "examDescription": "string",
  "examDuration": "string",
  "easy": number,
  "medium": number,
  "hard": number,
  "createdDate": Date,
  "adminId": number
}

export interface IexamData {
  content:IexamContentData[],
  pageNumber:number,
  pageSize:number,
  totalElements:number,
  totalPages:number
}
export interface Iexam{
  "message":string,
  "data":IexamData
}
