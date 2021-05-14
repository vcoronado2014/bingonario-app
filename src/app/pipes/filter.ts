import {Pipe, PipeTransform, Injectable} from '@angular/core';

@Pipe({
    name: 'filter'
})
@Injectable()
export class FilterPipe implements PipeTransform {
    transform(items: any[], field : string, value): any[] {
      if (!items) return [];
      if (!value || value.length === 0) return items;
      return items.filter(it =>
      it[field] === value);
    }
}