import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'alphabeticalOrder',
  standalone: true
})
export class AlphabeticalOrderPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    const sortedResults = value.sort((a: any, b: any) => {
      if (a.userName && b.userName) {
        return a.userName.localeCompare(b.userName);
      } else if (a.adminUserName && b.adminUserName) {
        return a.adminUserName.localeCompare(b.adminUserName);
      } else {
        return 0;
      }
    });


    return sortedResults;
  }

}
