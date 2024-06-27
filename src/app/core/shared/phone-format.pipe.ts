import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat'
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');

    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);

    let formatted = '(';

    for (let i = 0; i < limited.length; i++) {
      if (i === 3) formatted += ') ';
      if (i === 6) formatted += '-';
      formatted += limited[i];
    }

    return formatted;
  }
}