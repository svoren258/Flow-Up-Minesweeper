import { FormControl } from '@angular/forms';

export function integerRangeValidator(minValue: number, maxValue: number): (control: FormControl) => {[s: string]: boolean} {
  return (control: FormControl) => {
    if (!Number.isInteger(Number(control.value)) || control.value < minValue || control.value > maxValue) {
      return {invalid : true};
    }
    return null;
  }
}
