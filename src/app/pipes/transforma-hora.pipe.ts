import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'transformaHora'
})
export class TransformaHoraPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    moment.locale('es');
    return moment(value).format("HH:mm")
  }

}