import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizar'
})
export class CapitalizarPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(value == "" || value == null){
      return null;
    }else{
      var nombre = '';
      var arr = [];
      /* console.log(value);
      console.log(/\s/.test(value)); */

      //we test if there is space
      if (/\s/.test(value)) {
        // Borramos los espacios
        var res = value.split(" ");
       
        for (var i=0 ; i < res.length; i++){
          if(res[i] != ""){
            //console.log(res[i]);
            arr.push(res[i]);
            //console.log(arr);
            //return arr;
          }
        }

        for(var i = 0 ; i< res.length; i++){
          //console.log(arr);
          
          if(arr.length != 1){
            //console.log(arr[i]);
            if (arr[i].length <= 2){
              if(arr[i] != "SS" ){
                nombre += arr[i].toLowerCase()+ " ";
              }else{
                nombre += arr[i].toUpperCase()+ " ";
              }
              
            } else{
              if(arr[i] == "S.S" || arr[i] == "S.S." || arr[i] == "S.s.") {
                //console.log(arr[i]);
                nombre += arr[i].toUpperCase()+ " ";

              } else {
                nombre += arr[i][0].toUpperCase() + arr[i].substr(1).toLowerCase() + " ";
              }
            }
            

          }else{
            //console.log(arr);
            //console.log(value);
            return value[0].toUpperCase() + value.substr(1).toLowerCase();
            
          }
        }

        return nombre;

      }else{
        //console.log(value);
        return value[0].toUpperCase() + value.substr(1).toLowerCase();
        
      }

    }
    
  }

  buscarInfo(){
    
  }

}