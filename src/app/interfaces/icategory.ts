export interface IcategoryContentData {
  categoryName: string,
  num_easy: number,
  num_medium: number,
  num_hard: number,
  num_totalQuestions:number
}
export interface IcategoryContent {
 content:IcategoryContentData[],
  pageNumber:number,
  pageSize:number,
  totalElements:number,
  totalPages:number
}

export interface Icategory {
  message:string,
  data:IcategoryContent
}
export interface IcategoryTitle {
  message:string,
  data:string[]
}
