
export interface IuserContentData {
  userId:number,
  userName:string,
  phone:number,
  email:string
}
export interface IuserData {
  content:IuserContentData[],
  pageNumber:number,
  pageSize:number,
  totalElements:number,
  totalPages:number
}
export interface Iuser {
  message:string,
  data:IuserData
}
