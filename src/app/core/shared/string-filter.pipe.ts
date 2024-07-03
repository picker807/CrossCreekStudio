import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringFilter',
  pure: false
})
export class StringFilterPipe implements PipeTransform {
  transform(items: any[], filterString: string): any[] {
    if (!items || !filterString) {
      return items;
    }

    filterString = filterString.toLowerCase();

    return items.filter(item => {
      return Object.keys(item).some(key => {
        const value = item[key];
        if (value !== null && value !== undefined) {
          return value.toString().toLowerCase().includes(filterString);
        }
        return false;
      });
    });
  }
}