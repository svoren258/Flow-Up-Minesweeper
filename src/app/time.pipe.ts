import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform{
  transform(seconds: number): string {
    const time = (Math.floor(seconds / 36000)).toString() + ':'
      + (Math.floor(seconds / 600)) +
      + (Math.floor(seconds / 60) % 10).toString()
      + ':' + (Math.floor(seconds / 10) % 6).toString() + (seconds % 10).toString();
    return time;
  }
}
