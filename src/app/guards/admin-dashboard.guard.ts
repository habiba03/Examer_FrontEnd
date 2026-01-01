import {CanActivateFn} from '@angular/router';
import Swal from "sweetalert2";
import { JwtPayload,jwtDecode }  from "jwt-decode";
import {secureLocalStorage} from "../secureLocalStorage/secure-storage-util";

interface MyJwtPayload extends JwtPayload {
  role: string;
  id: number;
  sub: string;
}

// @ts-ignore
export const adminDashboardGuard: CanActivateFn = (route, state) => {

  let token = secureLocalStorage.getItem("token");

  if(token) {
    let encodedToken = JSON.stringify(token);
    let decodedToken = jwtDecode<MyJwtPayload>(encodedToken);
    let role = decodedToken.role;

    if(role === "admin"){
      return true;
    }else{
      Swal.fire({
        title: "You caught!",
        text: "You are not an admin",
        icon: "warning"
      });
      return false;
    }
  }
};
