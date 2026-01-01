
export interface IscoreContentData {
  userId:number,
  userName:string,
  examName:string,
  score:number
}
export interface IscoreData {
  content:IscoreContentData[],
  pageNumber:number,
  pageSize:number,
  totalElements:number,
  totalPages:number
}
export interface Iscore {
  message:string,
  data:IscoreData
}
