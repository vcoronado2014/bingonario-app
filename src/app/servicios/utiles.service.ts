import { Injectable, Component, ViewChild,  ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
//mobile
import { DeviceDetectorService } from 'ngx-device-detector';

import * as moment from 'moment';
import { TmplAstRecursiveVisitor } from '@angular/compiler';
declare var $:any;
import * as CryptoJS from 'crypto-js';
import { stat } from 'fs';

@Injectable()
export class UtilesService{
    clave = 'Bing0na&0_2020%2';
    //web encriptar desencriptar https://www.devglan.com/online-tools/aes-encryption-decryption
    constructor( 
        private httpClient: HttpClient,
        public device: DeviceDetectorService,
      ){
        
      }
      VerificaDispositivo(){
        var retorno = true;
        if (this.device.isDesktop()){
           retorno = false;
        }

        return retorno;
      }
      //proceso para encriptar desencriptar AES
      Encriptar(texto){
        return CryptoJS.AES.encrypt(texto, this.clave).toString();
      }
      Desencriptar(textoEncriptado){
        return CryptoJS.AES.decrypt(textoEncriptado, this.clave).toString(CryptoJS.enc.Utf8);
      }
      encriptarBtoa(texto) {
        return btoa(unescape(encodeURIComponent(texto)));
      }
      desencriptarBtoa(texto) {
        return decodeURIComponent(escape(atob(texto)));
      }

      EsMobil(){
        
        let breakpoints = {
          '(min-width: 1200px)': 'xl',
          '(min-width: 992px) and (max-width: 1199.98px)': 'lg',
          '(min-width: 768px) and (max-width: 991.98px)': 'md',
          '(min-width: 576px) and (max-width: 767.98px)': 'sm',
          '(max-width: 575.98px)': 'xs',
        }
    
        for (let media in breakpoints) {
          if (window.matchMedia(media).matches) {
            //return breakpoints[media];
            if (breakpoints[media] == 'md' || breakpoints[media] == 'sm' || breakpoints[media] == 'xs'){
              return true;
            }
          }
        }
    
        return false;
      }
      determinaTransaccion(status){
        var entidad = {
          Codigo: 0,
          Mensaje: '',
          Tipo: 'success'
        }
        switch (status){
          case 4:
            entidad.Mensaje = 'Operación realizada con éxito',
              entidad.Codigo = status;
            entidad.Tipo = 'success';
            break;
          case 6:
            entidad.Mensaje = 'Operación rechazada',
              entidad.Codigo = status;
            entidad.Tipo = 'warning';
            break;
          case 104:
            entidad.Mensaje = 'Operación con error',
              entidad.Codigo = status;
            entidad.Tipo = 'error';
            break;
          case 5:
            entidad.Mensaje = 'Tarjeta expirada',
              entidad.Codigo = status;
            entidad.Tipo = 'error';
            break;
          case 7:
            entidad.Mensaje = 'Operación pendiente',
              entidad.Codigo = status;
            entidad.Tipo = 'warning';
            break; 
          default:
            entidad.Mensaje = 'Operación con error',
              entidad.Codigo = status;
            entidad.Tipo = 'error';
            break;         
        }
        return entidad;
      }

      CerrarModal(nombreModal){
        nombreModal.hide();
        if ($('.modal-backdrop').is(':visible')) {
          $('body').removeClass('modal-open'); 
          $('.modal-backdrop').remove(); 
        };
      }
      OpenModal(nombreModal){
        nombreModal.show();
        /*
        if ($('.modal-backdrop').is(':visible')) {
          $('body').removeClass('modal-open'); 
          $('.modal-backdrop').remove(); 
        };
        */
      }
      InicializeOptionsSorteosAdmin(dtOptions, largoInicial, titulo){
        dtOptions = {
/*           info:{
            title: titulo,
            author: 'Víctor Coronado',
          }, */
            /* pagingType: 'full_numbers', */
            /* pagingType: 'numbers', */
            info: false,
            pagingType: 'simple',
            pageLength: largoInicial,
            language: {
              searchPlaceholder: "Busca tu sorteo...",
              search: "",
              "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json",
            },
            columnDefs: [
              {
                targets: [0, 1, 2],
                className: 'mdl-data-table__cell--non-numeric'
              },
              {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
              },
              { 
                orderable: false, targets: [3] 
              }
            ],
            lengthMenu: [8, 10, 20, 50],
            /* dom: 'Blfrtip', */
            dom: '<lf<t>ip>',
            buttons: [
              {
                extend: 'copy',
                title: titulo,
                text: 'Copiar',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2]
                }
              },
              {
                extend: 'print',
                title: titulo,
                text: 'Imprimir',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2]
                }
              },
              {
                extend: 'pdf',
                text: 'PDF',
                orientation: 'landscape',
                title: titulo,
                pageSize: 'A4',
                exportOptions: {
                  columns: [1, 2]
                }
                //className: 'btn btn-default btn-xs'
              },
              {
                extend: 'excel',
                title: titulo,
                text: 'Exportar a excel',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2]
                }
              },
            ],
            initComplete: function () {
              var btns = $('.dt-button');
              btns.addClass('btn btn-primary');
              btns.removeClass('dt-button');
            }

          };
          return dtOptions;
      }
      //lo que ocupa sorteos
      InicializeOptionsSorteos(dtOptions, largoInicial, titulo){
        dtOptions = {
/*           info:{
            title: titulo,
            author: 'Víctor Coronado',
          }, */
            /* pagingType: 'full_numbers', */
            /* pagingType: 'numbers', */
            info: false,
            pagingType: 'simple',
            pageLength: largoInicial,
            language: {
              searchPlaceholder: "Busca tu sorteo...",
              search: "",
              "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json",
            },
            columnDefs: [
              {
                targets: [0, 1, 2],
                className: 'mdl-data-table__cell--non-numeric'
              },
              {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
              },
              { 
                orderable: false, targets: [3] 
              }
            ],
            lengthMenu: [8, 10, 20, 50],
            /* dom: 'Blfrtip', */
            dom: '<lf<t>ip>',
            buttons: [
              {
                extend: 'copy',
                title: titulo,
                text: 'Copiar',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2]
                }
              },
              {
                extend: 'print',
                title: titulo,
                text: 'Imprimir',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2]
                }
              },
              {
                extend: 'pdf',
                text: 'PDF',
                orientation: 'landscape',
                title: titulo,
                pageSize: 'A4',
                exportOptions: {
                  columns: [1, 2]
                }
                //className: 'btn btn-default btn-xs'
              },
              {
                extend: 'excel',
                title: titulo,
                text: 'Exportar a excel',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2]
                }
              },
            ],
            initComplete: function () {
              var btns = $('.dt-button');
              btns.addClass('btn btn-primary');
              btns.removeClass('dt-button');
            }

          };
          return dtOptions;
      }
      //lo ocupa clientes y proveedores
      InicializeOptionsCLI(dtOptions, largoInicial, titulo){
        dtOptions = {
          info:{
            title: titulo,
            author: 'Víctor Coronado'
          },
            pagingType: 'full_numbers',
            pageLength: largoInicial,
            language: {
              "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
            },
            columnDefs: [
              {
                targets: [0, 1, 2],
                className: 'mdl-data-table__cell--non-numeric'
              },
              {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
              },
              { 
                orderable: false, targets: [7,8] 
              }
            ],
            lengthMenu: [8, 10, 20, 50],
            dom: 'Blfrtip',
           buttons: [
            {
                extend: 'copy',
                title: titulo,
                text: 'Copiar',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5, 6]
                }
            },
            {
                extend: 'print',
                title: titulo,
                text: 'Imprimir',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5, 6]
                }
            },
            {
                extend: 'pdf',
                text: 'PDF',
                orientation: 'landscape',
                title: titulo,
                pageSize: 'A4',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5, 6]
                }
                //className: 'btn btn-default btn-xs'
            },
            {
                extend: 'excel',
                title: titulo,
                text: 'Exportar a excel',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5, 6]
                }
            },
          ],
          initComplete: function(){
            var btns = $('.dt-button');
            btns.addClass('btn btn-primary');
            btns.removeClass('dt-button');
          }

          };
          return dtOptions;
      }
      InicializeOptionsDT(dtOptions, largoInicial, titulo){
        dtOptions = {
            info:{
              title: titulo,
              author: 'Víctor Coronado'
            },
            pagingType: 'full_numbers',
            pageLength: largoInicial,
            language: {
              "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
            },
            columnDefs: [
              {
                targets: [0, 1, 2],
                className: 'mdl-data-table__cell--non-numeric'
              },
              {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
              },
              { 
                orderable: false, targets: [5] 
              }
            ],
            lengthMenu: [8, 10, 20, 50],
            dom: 'Blfrtip',
            // Configure the buttons
            buttons: [
              {
                  extend: 'copy',
                  title: titulo,
                  text: 'Copiar',
                  exportOptions: {
                    columns: [1, 2, 3, 4]
                  }
              },
              {
                  extend: 'print',
                  title: titulo,
                  text: 'Imprimir',
                  exportOptions: {
                    columns: [1, 2, 3, 4]
                  }
              },
              {
                  extend: 'pdf',
                  text: 'PDF',
                  title: titulo,
                  pageSize: 'A4',
                  exportOptions: {
                    columns: [1, 2, 3, 4]
                  }
                  //className: 'btn btn-default btn-xs'
              },
              {
                  extend: 'excel',
                  title: titulo,
                  text: 'Exportar a excel',
                  exportOptions: {
                    columns: [1, 2, 3, 4]
                  }
              },
            ],
            initComplete: function(){
              var btns = $('.dt-button');
              btns.addClass('btn btn-primary');
              btns.removeClass('dt-button');
            }

          };
          return dtOptions;
      }
      InicializeOptionsDTFac(dtOptions, largoInicial, titulo){
        dtOptions = {
          info:{
            title: titulo,
            author: 'Víctor Coronado'
          },
            pagingType: 'full_numbers',
            pageLength: largoInicial,
            language: {
              "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
            },
            columnDefs: [
              {
                "targets": [ 0,6 ],
                "visible": false,
                "searchable": false
              },
              {
                "targets": [ 4 ],
                "type": 'currency'
              },
              { 
                orderable: false, targets: [6,7,8] 
              }
            ],
            lengthMenu: [8, 10, 20, 50],
            dom: 'Blfrtip',
            //esto hace que llegue el orden por defecto
            order:[],
            // Configure the buttons
            buttons: [
              {
                  extend: 'copy',
                  title: titulo,
                  text: 'Copiar',
                  exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                  }
              },
              {
                  extend: 'print',
                  title: titulo,
                  text: 'Imprimir',
                  exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                  }
              },
              {
                  extend: 'pdf',
                  //footer: true,
                  text: 'PDF',
                  exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                  },
                  title: titulo,
                  pageSize: 'A4',
                  //className: 'btn btn-default btn-xs'
              },
              {
                  extend: 'excel',
                  title: titulo,
                  text: 'Exportar a excel',
                  exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                  }
              },
            ],
            initComplete: function(){
              var btns = $('.dt-button');
              btns.addClass('btn btn-primary');
              btns.removeClass('dt-button');
            },
            "footerCallback": function (row, data, start, end, display) {
              var api = this.api(), data;

              // Remove the formatting to get integer data for summation
              var intVal = function (i) {
                /* return typeof i == 'string' ? i.replace(/[\$,.]/g, '') * 1 : typeof i == 'number' ?  i : 0; */
                var retorno = 0;
                if (typeof i === 'string'){
                  retorno = parseFloat(i.replace(/[\$,.]/g, '')) * 1;
                }
                else{
                  return i;
                }
                return retorno;
              };

              // Total over all pages
              var total = api
                .column(5)
                .data()
                .reduce(function (a, b) {
                  return intVal(a) + intVal(b);
                }, 0);

              // Total over this page
              var pageTotal = api
                .column(5, { page: 'current' })
                .data()
                .reduce(function (a, b) {
                  return intVal(a) + intVal(b);
                }, 0);

                var format = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0
                });

              $(api.column(4).footer()).html(
                '<span>' + 'Total página: ' + format.format(pageTotal).replace(',','.').replace(',','.') + '</span>' +
                '<span style="color:darkblue;font-size:1.3em;float:left;">' + ' Total General: ' + format.format(total).replace(',','.').replace(',','.') + '</span>'

              );
            }
            //esto es para cambiar el color de fuente de la fila
/*             ,
            "createdRow": function (row, data, dataIndex){
              //console.log($(row));
              //console.log(data);
              if (data[6] == 'Compra'){
                $(row).addClass('red-class');
              }
            } */

          };
          return dtOptions;
      }
      InicializeOptionsDTComp(dtOptions, largoInicial, titulo){
        dtOptions = {
          info:{
            title: titulo,
            author: 'Víctor Coronado'
          },
            pagingType: 'full_numbers',
            pageLength: largoInicial,
            language: {
              "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
            },
            columnDefs: [
              {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
              },
              {
                "targets": [ 5 ],
                "type": 'currency'
              },
              { 
                orderable: false, targets: [6] 
              }
            ],
            lengthMenu: [8, 10, 20, 50],
            dom: 'Blfrtip',
            //esto hace que llegue el orden por defecto
            order:[],
            // Configure the buttons
            buttons: [
              {
                  extend: 'copy',
                  title: titulo,
                  text: 'Copiar',
                  exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                  }
              },
              {
                  extend: 'print',
                  title: titulo,
                  text: 'Imprimir',
                  exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                  }
              },
              {
                  extend: 'pdf',
                  //footer: true,
                  text: 'PDF',
                  exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                  },
                  title: titulo,
                  pageSize: 'A4',
                  //className: 'btn btn-default btn-xs'
              },
              {
                  extend: 'excel',
                  title: titulo,
                  text: 'Exportar a excel',
                  exportOptions: {
                    columns: [1, 2, 3, 4, 5]
                  }
              },
            ],
            initComplete: function(){
              var btns = $('.dt-button');
              btns.addClass('btn btn-primary');
              btns.removeClass('dt-button');
            },
            "footerCallback": function (row, data, start, end, display) {
              var api = this.api(), data;

              // Remove the formatting to get integer data for summation
              var intVal = function (i) {
                /* return typeof i == 'string' ? i.replace(/[\$,.]/g, '') * 1 : typeof i == 'number' ?  i : 0; */
                var retorno = 0;
                if (typeof i === 'string'){
                  retorno = parseFloat(i.replace(/[\$,.]/g, '')) * 1;
                }
                else{
                  return i;
                }
                return retorno;
              };

              // Total over all pages
              var total = api
                .column(5)
                .data()
                .reduce(function (a, b) {
                  return intVal(a) + intVal(b);
                }, 0);

              // Total over this page
              var pageTotal = api
                .column(5, { page: 'current' })
                .data()
                .reduce(function (a, b) {
                  return intVal(a) + intVal(b);
                }, 0);

                var format = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0
                });

              $(api.column(4).footer()).html(
                '<span>' + 'Total página: ' + format.format(pageTotal).replace(',','.').replace(',','.') + '</span>' +
                '<span style="color:darkblue;font-size:1.3em;float:left;">' + ' Total General: ' + format.format(total).replace(',','.').replace(',','.') + '</span>'

              );
            }
            //esto es para cambiar el color de fuente de la fila
/*             ,
            "createdRow": function (row, data, dataIndex){
              //console.log($(row));
              //console.log(data);
              if (data[6] == 'Compra'){
                $(row).addClass('red-class');
              }
            } */

          };
          return dtOptions;
      }
      //prestamos
      InicializeOptionsPrestamo(dtOptions, largoInicial, titulo){
        dtOptions = {
          info:{
            title: titulo,
            author: 'Víctor Coronado'
          },
            pagingType: 'full_numbers',
            pageLength: largoInicial,
            language: {
              "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
            },
            columnDefs: [
              {
                targets: [0, 1, 2],
                className: 'mdl-data-table__cell--non-numeric'
              },
              {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
              },
              { 
                orderable: false, targets: [7, 8, 9] 
              }
            ],
            lengthMenu: [8, 10, 20, 50],
            dom: 'Blfrtip',
           buttons: [
            {
                extend: 'copy',
                title: titulo,
                text: 'Copiar',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5, 6]
                }
            },
            {
                extend: 'print',
                title: titulo,
                text: 'Imprimir',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5, 6]
                }
            },
            {
                extend: 'pdf',
                text: 'PDF',
                orientation: 'landscape',
                title: titulo,
                pageSize: 'A4',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5, 6]
                }
                //className: 'btn btn-default btn-xs'
            },
            {
                extend: 'excel',
                title: titulo,
                text: 'Exportar a excel',
                orientation: 'landscape',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5, 6]
                }
            },
          ],
          initComplete: function(){
            var btns = $('.dt-button');
            btns.addClass('btn btn-primary');
            btns.removeClass('dt-button');
          }

          };
          return dtOptions;
      }
            //prestamos
      InicializeOptionsArriendo(dtOptions, largoInicial, titulo) {
        dtOptions = {
          info: {
            title: titulo,
            author: 'Víctor Coronado'
          },
          pagingType: 'full_numbers',
          pageLength: largoInicial,
          language: {
            "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
          },
          columnDefs: [
            {
              targets: [0, 1, 2],
              className: 'mdl-data-table__cell--non-numeric'
            },
            {
              "targets": [0, 7],
              "visible": false,
              "searchable": false
            },
            {
              orderable: false, targets: [8]
            }
          ],
          lengthMenu: [8, 10, 20, 50],
          dom: 'Blfrtip',
          buttons: [
            {
              extend: 'copy',
              title: titulo,
              text: 'Copiar',
              orientation: 'landscape',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6]
              }
            },
            {
              extend: 'print',
              title: titulo,
              text: 'Imprimir',
              orientation: 'landscape',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6]
              }
            },
            {
              extend: 'pdf',
              text: 'PDF',
              orientation: 'landscape',
              title: titulo,
              pageSize: 'A4',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6]
              }
              //className: 'btn btn-default btn-xs'
            },
            {
              extend: 'excel',
              title: titulo,
              text: 'Exportar a excel',
              orientation: 'landscape',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6]
              }
            },
          ],
          initComplete: function () {
            var btns = $('.dt-button');
            btns.addClass('btn btn-primary');
            btns.removeClass('dt-button');
          }

        };
        return dtOptions;
      }
      //consolidado
      InicializeOptionsConsolidado(dtOptions, largoInicial, titulo) {
        dtOptions = {
          info: {
            title: titulo,
            author: 'Víctor Coronado'
          },
          pagingType: 'full_numbers',
          pageLength: largoInicial,
          language: {
            "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
          },
          columnDefs: [
            {
              targets: [0, 1, 2],
              className: 'mdl-data-table__cell--non-numeric'
            },
            {
              "targets": [0],
              "visible": false,
              "searchable": false
            },
            {
              orderable: false, targets: [3, 4]
            }
          ],
          lengthMenu: [8, 10, 20, 50],
          dom: 'Blfrtip',
          buttons: [
            {
              extend: 'copy',
              title: titulo,
              text: 'Copiar',
              orientation: 'landscape',
              exportOptions: {
                columns: [1, 2, 3, 4]
              }
            },
            {
              extend: 'print',
              title: titulo,
              text: 'Imprimir',
              orientation: 'landscape',
              exportOptions: {
                columns: [1, 2, 3, 4]
              }
            },
            {
              extend: 'pdf',
              text: 'PDF',
              orientation: 'landscape',
              title: titulo,
              pageSize: 'A4',
              exportOptions: {
                columns: [1, 2, 3, 4]
              }
              //className: 'btn btn-default btn-xs'
            },
            {
              extend: 'excel',
              title: titulo,
              text: 'Exportar a excel',
              orientation: 'landscape',
              exportOptions: {
                columns: [1, 2, 3, 4]
              }
            },
          ],
          initComplete: function () {
            var btns = $('.dt-button');
            btns.addClass('btn btn-primary');
            btns.removeClass('dt-button');
          }

        };
        return dtOptions;
      }
      retornaCondicionVenta(condicion){
        var retorno = '';
        if (condicion == 'O'){
          retorno = 'Contado/Crédito';
        }
        else if (condicion == 'C'){
          retorno = 'Contado';
        }
        else if (condicion == 'R'){
          retorno = 'Crédito';
        }
        else if (condicion == 'P'){
          retorno = 'Por Cobrar';
        }
        else{
          retorno = 'No definida';
        }

        return retorno;
      }
      retornaTipoFactura(tipo){
        var retorno = '';
        if (tipo == '2'){
          retorno = 'Venta';
        }
        else{
          retorno = 'Compra';
        }
        return retorno;
      }

      InsertaReemplazaElemento(nuevoElemento, arreglo){
        var esta = false;
        if (arreglo && arreglo.length >= 0){
          arreglo.forEach(cliente => {
            if (cliente.Id == nuevoElemento.Id){
              cliente.CiuClient = nuevoElemento.CiuClient;
              cliente.ComClient = nuevoElemento.ComClient;
              cliente.ConClient = nuevoElemento.ConClient;
              cliente.DigClient = nuevoElemento.DigClient;
              cliente.DirClient = nuevoElemento.DirClient;
              cliente.Eliminado = nuevoElemento.Eliminado;
              cliente.FaxClient = nuevoElemento.FaxClient;
              cliente.GirClient = nuevoElemento.GirClient;
              cliente.Id = nuevoElemento.Id;
              cliente.NomClient = nuevoElemento.NomClient;
              cliente.RutClient = nuevoElemento.RutClient;
              cliente.TelClient = nuevoElemento.TelClient;
              cliente.CorreoClient = nuevoElemento.CorreoClient;
              cliente.FleLocal = nuevoElemento.FleLocal;
              cliente.FleDomici = nuevoElemento.FleDomici;
              cliente.DesClient = nuevoElemento.DesClient;
              esta = true;
            }
          });
          if (esta == false){
            var cliente = {
              Id: nuevoElemento.Id,
              CiuClient: nuevoElemento.CiuClient,
              ComClient: nuevoElemento.ComClient,
              DigClient: nuevoElemento.DigClient,
              DirClient: nuevoElemento.DirClient,
              Eliminado: nuevoElemento.Eliminado,
              FaxClient: nuevoElemento.FaxClient,
              GirClient: nuevoElemento.GirClient,
              NomClient: nuevoElemento.NomClient,
              RutClient: nuevoElemento.RutClient,
              TelClient: nuevoElemento.TelClient,
              CorreoClient: nuevoElemento.CorreoClient,
              FleLocal: nuevoElemento.FleLocal,
              FleDomici: nuevoElemento.FleDomici,
              DesClient: nuevoElemento.DesClient
            }

            arreglo.push(cliente);
          }
        }
        return arreglo;
      }
      ComparaFechas(fechaInicio, fechaTermino){
        var momentA = moment(fechaInicio, 'DD/MM/YYYY');
        var momentB = moment(fechaTermino, 'DD/MM/YYYY');
        if (momentA > momentB) return 1;
        else if (momentA < momentB) return -1;
        else return 0;
      }

      VerificaObjetoArray(nombre, arreglo){
        var retorno = false;
        if (arreglo && arreglo.length > 0){
          arreglo.forEach(giro => {
            if (giro.Nombre.toUpperCase() == nombre.toUpperCase()){
              retorno = true;
            }
          });
        }
        return retorno;
      }
      UpperCaseF(a) {
        setTimeout(function () {
          a.target.value = a.target.value.toUpperCase();
        }, 1);
      }
      entregaFechaDetalle(fechaStr){
        var fecha = moment(fechaStr);
        var retorno = fecha.format('MMM').replace('.', '') + ' ' + fecha.format('YYYY');
        return retorno.toUpperCase();
      }
      retornaFechaFormateada(fechaMoment) {
        var retorno = '';
        var year = fechaMoment.year();
        var mes = fechaMoment.month() + 1;
        var dia = fechaMoment.date();
        var mesStr = '';
        var diaStr = '';
        if (mes < 10) {
          mesStr = '0' + mes.toString();
        }
        else {
          mesStr = mes.toString();
        }
    
        if (dia < 10) {
          diaStr = '0' + dia.toString();
        }
        else {
          diaStr = dia.toString();
        }
    
        retorno = diaStr + '/' + mesStr + '/' + year;
    
        return retorno;
      }
      entregaMes(mesInt){
        var retorno = '';
        switch(mesInt){
          case 1:
            retorno = 'Enero';
            break;
          case 2:
            retorno = 'Feberero';
            break;
          case 3: 
            retorno = 'Marzo';
            break;
          case 4:
            retorno = 'Abril';
            break;
          case 5:
            retorno = 'Mayo';
            break;
          case 6:
            retorno = 'Junio';
            break;
          case 7:
            retorno = 'Julio';
            break;
          case 8:
            retorno = 'Agosto';
            break;
          case 9:
            retorno = 'Septiembre';
            break;
          case 10:
            retorno = 'Octubre';
            break;
          case 11:
            retorno = 'Noviembre';
            break;
          case 12:
            retorno = 'Diciembre';
            break;
        }
        return retorno;
      }
      //validacion rut
      validaRut (rutCompleto, digito) {
        rutCompleto = rutCompleto + '-' + digito;
        rutCompleto = rutCompleto.replace("‐","-");
        if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto))
          return false;
        var tmp 	= rutCompleto.split('-');
        var digv	= tmp[1]; 
        var rut 	= tmp[0];
        if ( digv == 'K' ) digv = 'k' ;
        
        return (this.dv(rut) == digv );
      }
      entregaErrorForma(forma){
        var sms = '';
        if (forma.controls){
            for (const field in forma.controls) { // 'field' is a string
                const control = forma.get(field); // 'control' is a FormControl
                console.log(control);
                if (control.status == "INVALID"){
                    //agregamos los mensajes
                    var nombreCampo = field.replace('nuevo', '');
                    sms += nombreCampo + ', \n';
                }
            }
        }
        return sms + ' son campos requeridos.';
      }
      private dv(T){
        var M=0,S=1;
        for(;T;T=Math.floor(T/10))
          S=(S+T%10*(9-M++%6))%11;
        return S?S-1:'k';
      }

      validaFechaEntera(strFecha){
        //formato que viene 03042020
        var retorno = this.retornaFechaFormateada(moment());
        var arrStr = strFecha.split('');
        if (arrStr.length == 8){
          //los dos primero elementos es el dia
          var diaInt = parseInt(arrStr[0].toString() + arrStr[1].toString());
          var mesInt = parseInt(arrStr[2].toString() + arrStr[3].toString());

          if (diaInt > 0 && diaInt <= 31 && mesInt > 0 && mesInt <= 12){
            var dia = arrStr[0].toString() + arrStr[1].toString();
            var mes = arrStr[2].toString() + arrStr[3].toString();
            var anio = arrStr[4].toString() + arrStr[5].toString() + arrStr[6].toString() + arrStr[7].toString();
            retorno = dia + '/' + mes + '/' + anio;
          }
          

        }
        return retorno;

      }

      //numero a letras
      private Unidades(num){

        switch(num)
        {
          case 1: return "UN";
          case 2: return "DOS";
          case 3: return "TRES";
          case 4: return "CUATRO";
          case 5: return "CINCO";
          case 6: return "SEIS";
          case 7: return "SIETE";
          case 8: return "OCHO";
          case 9: return "NUEVE";
        }
      
        return "";
      }
      private Decenas(num){

        var decena = Math.floor(num/10);
        var unidad = num - (decena * 10);
      
        switch(decena)
        {
          case 1:   
            switch(unidad)
            {
              case 0: return "DIEZ";
              case 1: return "ONCE";
              case 2: return "DOCE";
              case 3: return "TRECE";
              case 4: return "CATORCE";
              case 5: return "QUINCE";
              default: return "DIECI" + this.Unidades(unidad);
            }
          case 2:
            switch(unidad)
            {
              case 0: return "VEINTE";
              default: return "VEINTI" + this.Unidades(unidad);
            }
          case 3: return this.DecenasY("TREINTA", unidad);
          case 4: return this.DecenasY("CUARENTA", unidad);
          case 5: return this.DecenasY("CINCUENTA", unidad);
          case 6: return this.DecenasY("SESENTA", unidad);
          case 7: return this.DecenasY("SETENTA", unidad);
          case 8: return this.DecenasY("OCHENTA", unidad);
          case 9: return this.DecenasY("NOVENTA", unidad);
          case 0: return this.Unidades(unidad);
        }
      }
      private DecenasY(strSin, numUnidades){
        if (numUnidades > 0)
          return strSin + " Y " + this.Unidades(numUnidades)
      
        return strSin;
      }
      private Centenas(num){

        var centenas = Math.floor(num / 100);
        var decenas = num - (centenas * 100);
      
        switch(centenas)
        {
          case 1:
            if (decenas > 0)
              return "CIENTO " + this.Decenas(decenas);
            return "CIEN";
          case 2: return "DOSCIENTOS " + this.Decenas(decenas);
          case 3: return "TRESCIENTOS " + this.Decenas(decenas);
          case 4: return "CUATROCIENTOS " + this.Decenas(decenas);
          case 5: return "QUINIENTOS " + this.Decenas(decenas);
          case 6: return "SEISCIENTOS " + this.Decenas(decenas);
          case 7: return "SETECIENTOS " + this.Decenas(decenas);
          case 8: return "OCHOCIENTOS " + this.Decenas(decenas);
          case 9: return "NOVECIENTOS " + this.Decenas(decenas);
        }
      
        return this.Decenas(decenas);
      }
      private Seccion(num, divisor, strSingular, strPlural){
        var cientos = Math.floor(num / divisor)
        var resto = num - (cientos * divisor)
      
        var letras = "";
      
        if (cientos > 0)
          if (cientos > 1)
            letras = this.Centenas(cientos) + " " + strPlural;
          else
            letras = strSingular;
      
        if (resto > 0)
          letras += "";
      
        return letras;
      }
      private Miles(num){
        var divisor = 1000;
        var cientos = Math.floor(num / divisor)
        var resto = num - (cientos * divisor)
      
        var strMiles = this.Seccion(num, divisor, "UN MIL", "MIL");
        var strCentenas = this.Centenas(resto);
      
        if(strMiles == "")
          return strCentenas;
      
        return strMiles + " " + strCentenas;
      
        //return Seccion(num, divisor, "UN MIL", "MIL") + " " + Centenas(resto);
      }
      private Millones(num){
        var divisor = 1000000;
        var cientos = Math.floor(num / divisor)
        var resto = num - (cientos * divisor)
      
        var strMillones = this.Seccion(num, divisor, "UN MILLON", "MILLONES");
        var strMiles = this.Miles(resto);
      
        if(strMillones == "")
          return strMiles;
      
        return strMillones + " " + strMiles;
      
        //return Seccion(num, divisor, "UN MILLON", "MILLONES") + " " + Miles(resto);
      }
      numeroALetras(num){
        var data = {
          numero: num,
          enteros: Math.floor(num),
          centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
          letrasCentavos: "",
          letrasMonedaPlural: "PESOS",
          letrasMonedaSingular: "PESO"
        };
      
        if (data.centavos > 0)
          data.letrasCentavos = "CON " + data.centavos + "/100";
      
        if(data.enteros == 0)
          return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;
        if (data.enteros == 1)
          return this.Millones(data.enteros) + " " + data.letrasMonedaSingular + " " + data.letrasCentavos;
        else
          return this.Millones(data.enteros) + " " + data.letrasMonedaPlural + " " + data.letrasCentavos;
      }
}