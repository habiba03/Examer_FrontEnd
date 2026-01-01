export interface IadminData {
    adminId: number,
    adminUserName: string,
    phone: number,
    email: string,
}
export interface IadminContent{
  content:IadminData[],
  pageNumber:number,
  pageSize:number,
  totalElements:number,
  totalPages:number
}
export interface Iadmin {
  message:string,
  data:IadminContent
}
