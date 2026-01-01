import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'qustionContent',
  standalone: true
})
export class QustionContentPipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): any {
    const words = value.split(' ');  // Split the string into an array of words
    return words.slice(0, 2).join(' ');
  }

}
