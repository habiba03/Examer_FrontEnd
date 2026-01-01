import { CanActivateFn } from '@angular/router';
import {jwtDecode, JwtPayload} from "jwt-decode";
import Swal from "sweetalert2";
import {secureLocalStorage} from "../secureLocalStorage/secure-storage-util";

interface MyJwtPayload extends JwtPayload {
  role: string;
  id: number;
  sub: string;
}

// @ts-ignore
export const superAdminDashboardGuard: CanActivateFn = (route, state) => {
  let token = secureLocalStorage.getItem("token");

  if(token) {
    let encodedToken = JSON.stringify(token);
    let decodedToken = jwtDecode<MyJwtPayload>(encodedToken);
    let role = decodedToken.role;

    if(role === "super_admin"){
      return true;
    }else{
      Swal.fire({
        title: "You caught!",
        text: "You are not a super admin",
        icon: "warning"
      });
      return false;
    }
  }
};
