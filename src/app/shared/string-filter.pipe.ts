import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringFilter',
  pure: false // Set to false if you want the pipe to update whenever the input changes
})
export class StringFilterPipe implements PipeTransform {
  transform(items: any[], filterString: string, propertyName: string): any[] {
    if (!items || !filterString || !propertyName) {
      return items;
    }

    filterString = filterString.toLowerCase();

    return items.filter(item => {
      const itemValue = item[propertyName].toString().toLowerCase();
      return itemValue.includes(filterString);
    });
  }
}