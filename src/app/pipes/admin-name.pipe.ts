import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'adminName',
  standalone: true
})
export class AdminNamePipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): any {
    if(value)
    return value[0];
  }

}
