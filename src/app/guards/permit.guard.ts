import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { inject } from '@angular/core';
import { secureLocalStorage } from '../secureLocalStorage/secure-storage-util';

export const permitGuard: CanActivateFn = (route, state) => {
  let token = secureLocalStorage.getItem('token');

  let router = inject(Router);
  if (token === null) {
    return true;
  } else {
    return false;
  }
};
