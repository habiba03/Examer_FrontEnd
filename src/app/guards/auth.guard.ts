import {CanActivateFn, Router} from '@angular/router';
import Swal from "sweetalert2";
import {inject} from "@angular/core";
import {secureLocalStorage} from "../secureLocalStorage/secure-storage-util";

export const authGuard: CanActivateFn = (route, state) => {
  let token = secureLocalStorage.getItem("token");

  let router = inject(Router)
  if(token !== null){
    return true;
  }else{
    Swal.fire({
      title: "You caught!",
      text: "You must login",
      icon: "warning"
    });
    router.navigate(['/pages/login']);
    return false;
  }

};
