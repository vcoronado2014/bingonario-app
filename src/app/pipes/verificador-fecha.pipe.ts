import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'verificadorFecha'
})
export class VerificadorFechaPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value == ''){
      return "Todos";
    }
    moment.locale('es');
    return moment(value).format("dddd, DD MMMM YYYY")
  }

}