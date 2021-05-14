import { Injectable, Component } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
//service
import { UtilesService } from '../servicios/utiles.service';

@Injectable()
export class PdfService {
    constructor(
        private utiles: UtilesService
    ){

    }
    //para reporte consolidado
    generatePdfConsolidado(action='open', detalle, persona){
        const documentDefinition = this.getDocumentDefinitionConsolidado(persona, detalle);

        switch (action) {
            case 'open': pdfMake.createPdf(documentDefinition).open(); break;
            case 'print': pdfMake.createPdf(documentDefinition).print(); break;
            case 'download': pdfMake.createPdf(documentDefinition).download(); break;
            default: pdfMake.createPdf(documentDefinition).open(); break;
        }

    }
    private columnasEncabezado(){
        var columns = [];
        var institucion = this.retornaInstitucion();
        var entidadTitulo =  {
            type: 'none',
            ol: [
                { text: institucion.Titulo, style: 'header', alignment: 'center' },
                { text: institucion.Nombre, alignment: 'center', fontSize: 12 },
                { text: 'Giro: ' + institucion.Giro, alignment: 'center', fontSize: 9 },
                { text: institucion.Direccion + ' ' + institucion.Comuna, alignment: 'center', fontSize: 9 },
                { text: 'Telefono:' + institucion.Telefono + '- Fax: ' + institucion.Fax, alignment: 'center', fontSize: 9 },
                { text: 'Email: ' + institucion.CorreoElectronico, alignment: 'center', fontSize: 9 }
            ]
        }
        
        var entidadNombreInstitucion = {
            type: 'none',
            ol: [
                { text: 'R.U.T.-' + institucion.Rut + '-' + institucion.Dv, style: 'grande', alignment: 'center' },
                { text: 'Listado Consolidaddo', alignment: 'center', fontSize: 12 },
                { text: '', alignment: 'center', style: 'grande' }
            ]
        }
        
        columns.push(entidadTitulo);
        columns.push(entidadNombreInstitucion);
        return columns;

    }
    //para la matriz de punto
    generatePdfPunto(action = 'print', documento, persona, detalle){
        const documentDefinition = this.getDocumentDefinitionPunto(documento, persona, detalle);

        switch (action) {
            case 'open': pdfMake.createPdf(documentDefinition).open(); break;
            case 'print': pdfMake.createPdf(documentDefinition).print(); break;
            case 'download': pdfMake.createPdf(documentDefinition).download(); break;
            default: pdfMake.createPdf(documentDefinition).open(); break;
        }
    }
    private getDocumentDefinitionConsolidado(persona, detalle) {
        //por mientras retornamos solo el texto
        return {
            //configuraciones
            pageSize: 'A4',
            pageMargins: [20,40,20,40],
            pageOrientation: 'landscape',
            content: [
                //'This is an sample PDF printed with pdfMake',
                {
                    columns: this.columnasEncabezado()
                },
                //columna cliente
                {
                    margin: [30, 17],
                    style: 'tableExample',
                    //border: [false, false, false, false],
                    table: {
                        heights: [25, 20, 20],
                        //widths: [220, '*', 110, '*'],
                        widths: [180, 140, '*'],
                        body:
                            this.bodyDatosColumnaUnoConsolidado(persona),
                    },
                    layout: 'noBorders',
                },
                {
                    table:{
                        widths: [180, '*', 'auto', 'auto', 'auto'],
                        body: this.retornaArregloPrestamo(detalle),
                    }
                },

            ],
            styles: {
                nota: {
                    fontSize: 10
                },
                negrita:{
                    bold: true,
                    fontSize: 9
                },
                header: {
                    bold: true,
                    fontSize: 15
                },
                grande: {
                    bold: true,
                    fontSize: 18
                },
                tableExample: {
                    margin: [0, 0, 0, 0]
                },
                tableExampleDetalle: {
                    margin: [0, 0, 0, 0],
                    fontSize: 8
                },
                quote: {
                    italics: true
                },
                small: {
                    fontSize: 8
                }
            },
            defaultStyle: {
                fontSize: 12
            }
        }
    }
    private retornaArregloPrestamo(prestamos){
        var retorno = [];
        var contadorLlenos = 0;
        var contadorVacios = 0;
        var header = [
            { text: 'Producto', bold: true }, { text: 'Series', bold: true }, { text: 'Capacidad', alignment: 'center', bold: true }, { text: 'Llenos', alignment: 'center', bold: true }, { text: 'Vacios', alignment: 'center', bold: true }
        ];
        retorno.push(header);
        if (prestamos.length > 0){
            prestamos.forEach(prestamo => {
                var arr = [];
                var entidadP = {
                    text:''
                };
                var entidadS = {
                    text:''
                };
                var entidadC = {
                    text:'',
                    alignment: 'center'
                };
                var entidadL = {
                    text:'',
                    alignment: 'center'
                };
                var entidadV = {
                    text:'',
                    alignment: 'center'
                };
                if (prestamo.Serie.length > 0){
                    prestamo.Serie.forEach(serie => {
                        entidadS.text += 'Nro. Serie: ' + serie.NroSerie + ' ,Observaciones: ' + serie.Observaciones + '\r\n';
                    });
                }
                entidadP.text = prestamo.NombreProducto;
                entidadC.text = prestamo.Capacidad.toString();
                entidadL.text = prestamo.Llenos.toString();
                entidadV.text = prestamo.Vacios.toString();
                arr.push(entidadP);
                arr.push(entidadS);
                arr.push(entidadC);
                arr.push(entidadL);
                arr.push(entidadV);
                contadorLlenos += prestamo.Llenos;
                contadorVacios += prestamo.Vacios;
                retorno.push(arr);

            });
        }
        var footer = [
            { text: '' }, { text: '' }, { text: 'Total', alignment: 'center', bold: true }, { text: contadorLlenos.toString(), alignment: 'center', bold: true }, { text: contadorVacios.toString(), alignment: 'center', bold: true }
        ];
        retorno.push(footer);

        return retorno;
    }
    private bodyDatosColumnaUnoConsolidado(cliente){
        var body = [
            //header
            [
                {
                    fillColor: '#eeeeee',
                    text: 'NOMBRE O RAZÓN SOCIAL',
                    colSpan: 2
                },
                {
                    //vacia
                },
                {
                    fillColor: '#eeeeee',
                    text: 'GIRO'
                },

            ],
            //datos de la tabla
            [
                //columna 1
                { 
                    text: cliente.NomClient, fontSize: 10, bold: true, colSpan: 2
                },
                //columna 4
                {
                    //vacia
                },
                //columna 2
                {
                    //text: cliente.DirClient + ', ' + cliente.ComClient, fontSize: 10, bold: true 
                    text: cliente.GirClient, fontSize: 10, bold: true 
                },

            ],
            //header
            [
                {
                    fillColor: '#eeeeee',
                    text: 'DIRECCIÓN'
                },
                {
                    fillColor: '#eeeeee',
                    text: 'COMUNA'
                },
                {
                    fillColor: '#eeeeee',
                    text: 'RUT CLIENTE'
                }
            ],
            //datos de la tabla
            [
                //columna 1
                { 
                    text: cliente.DirClient, fontSize: 10, bold: true  
                },
                //columna 2
                {
                    text: cliente.ComClient, fontSize: 10, bold: true 
                },
                //columna 4
                { 
                    //text: condicion,  fontSize: 10, bold: true 
                    text: cliente.RutClient + '-' + cliente.DigClient,  fontSize: 10, bold: true 
                },
            ],
        
        ];
        return body;
    }
    private getDocumentDefinitionPunto(documento, persona, detalle) {
        //por mientras retornamos solo el texto
        return {
            //configuraciones
            pageSize: 'A4',
            pageMargins: [20,40,20,40],
            content: [
                //numero factura
                {
                    columns: [
                        {
                            text: ''
                        },
                        {
                            text: documento.NumFactur.toString(), fontSize: 12, alignment: 'center'
                        }
                    ],
                    margin: [0, 90]


                },
                //datos de destino
                {
                    //original sin numero factura
                    //margin: [30, 212],
                    margin: [30, 17],
                    style: 'tableExample',
                    //border: [false, false, false, false],
                    table: {
                        heights: [25, 20, 20],
                        //widths: [220, '*', 110, '*'],
                        widths: [180, 140, '*', '*'],
                        body: this.bodyDatosColumnaUnoPunto(persona, documento)
                    },
                    layout: 'noBorders'
                },
                {
                    margin: [10, 70],
                    style: 'tableExampleDetalle',
                    table: {
                        //widths: ['180', '140', '100', '100', '*','*'],
                        //widths: ['*', 'auto', 'auto', 'auto', 'auto','auto'],
                        widths: ['15%', '30%', '11%', '14.6%', '14.6%','14.6%'],
                        body: this.arrDetallePunto(detalle, documento)
                    },
                    layout: 'noBorders'
                },
                //NUMERO A LETRAS
                {
                    text: this.entregaLetras(documento), fontSize: 8,
                    //posicion absoluta, no se mueve
                    absolutePosition: {
                        x:50, y:640
                    }
                },
                //NETO
                {
                    text: this.formatMoney(parseInt(documento.Neto),0,',','.'), fontSize: 8, alignment: 'right',
                    //posicion absoluta, no se mueve
                    absolutePosition: {
                        x:540, y:630
                    }
                },
                //impuesto
                {
                    text: this.formatMoney(parseInt(documento.Iva), 0, ',', '.'), fontSize: 8, alignment: 'right',
                    //posicion absoluta, no se mueve
                    absolutePosition: {
                        x: 540, y: 662
                    }
                },
                //total
                {
                    text: this.formatMoney(documento.Total, 0, ',', '.'), fontSize: 8, alignment: 'right',
                    //posicion absoluta, no se mueve
                    absolutePosition: {
                        x: 540, y: 692
                    }
                },
                //nota
                {
                    text: 'NOTA: IMPORTANTE ESTA FACTURA DEBE SER CANCELADA EN EL PLAZO CONVENIDO',
                    fontSize: 8,
                    absolutePosition: {
                        x: 50, y: 660
                    }
                },
                //nota
                {
                    text: 'DE LO CONTRARIO SE RECARGARÁ EN UN ______ % DE INTERÉS MENSUAL.',
                    fontSize: 8,
                    absolutePosition: {
                        x: 50, y: 670
                    }
                },
                /*
                //CANCELADO
                {
                    text: 'CANCELADO _____________ DE ___________________________ DEL _____________',
                    style: 'negrita',
                    absolutePosition: {
                        x: 40, y: 720
                    }
                },
                //FIRMA
                {
                    text: 'Nombre ________________________________________________________________________ R.U.T. _________________________\n\n' +
                        'Fecha______________________________ Recinto:_______________________________ Firma: ______________________________',
                    style: ['quote', 'small'],
                    absolutePosition: {
                        x: 40, y: 740
                    }

                },
                */

            ],
            styles: {
                nota: {
                    fontSize: 10
                },
                negrita:{
                    bold: true,
                    fontSize: 9
                },
                header: {
                    bold: true,
                    fontSize: 15
                },
                grande: {
                    bold: true,
                    fontSize: 18
                },
                tableExample: {
                    margin: [0, 0, 0, 0]
                },
                tableExampleDetalle: {
                    margin: [0, 0, 0, 0],
                    fontSize: 8
                },
                quote: {
                    italics: true
                },
                small: {
                    fontSize: 8
                }
            },
            defaultStyle: {
                fontSize: 12
            }
        }
    }
    private bodyDatosColumnaUnoPunto(cliente, documento){
        var condicion = '';
        if (documento.ConFactur == 'O'){
            condicion = 'CONTADO';
        }
        else{
            condicion = 'CHEQUE';
        }
        var body = [
            //header
            [
                //columna 1
                {
                    text: cliente.NomClient, fontSize: 8
                },
                //columna 2
                {
                    text: cliente.GirClient, fontSize: 8
                },
                //columna 3
                {
                    //vacia
                    text: ''
                },
                {

                    text: documento.FeeFactur, fontSize: 8, alignment: 'right'
                }

            ],
            [
                //columna 1
                {
                    text: cliente.DirClient, fontSize: 8
                },
                //columna 2
                {
                    text: cliente.ComClient, fontSize: 8
                },
                //columna 3
                {
                    //vacia
                    text: documento.GuiFactur, fontSize: 8
                },
                {

                    text: cliente.RutClient + '-' + cliente.DigClient, fontSize: 8, alignment: 'right'
                }

            ],
            [
                //columna 1
                {
                    text: condicion, fontSize: 8, alignment: 'center'
                },
                //columna 2
                {
                    text: ''
                },
                //columna 3
                {
                    //vacia
                    text: ''
                },
                {

                    text: ''
                }

            ]
        
        ];
        return body;
    }
    private arrDetallePunto(detalle, documento){
        var arreglo = [];
        
        
        if (detalle && detalle.length > 0){
            detalle.forEach(elem => {
                //CurrencyFormat
                var preDetail = this.formatMoney(elem.PreDetall, 0,',','.');
                var netDetail = this.formatMoney(elem.NetDetall, 0,',','.');
                var linea = [];
                var proD = {text: elem.ProDetall, alignment: 'left'};
                var nomP = {text: elem.NomProduc, alignment: 'left'};
                var vacio = { text: ''};
                var volD = {text: elem.VolDetall.toString(), alignment: 'right'};
                var preD = {text: preDetail, alignment: 'right'};
                var netoD = {text: netDetail, alignment: 'right'};
                /*
                linea.push(elem.ProDetall);
                linea.push(elem.NomProduc);
                linea.push('');
                linea.push(elem.VolDetall.toString());
                //formatear
                linea.push(preDetail);
                linea.push(netDetail);
                */
               linea.push(proD);
               linea.push(nomP);
               linea.push(vacio);
               linea.push(volD);
               linea.push(preD);
               linea.push(netoD);
                arreglo.push(linea);
            });
        }

        return arreglo;
    }

    generatePdfCompra(action = 'open', documento, persona, detalle) {
        const documentDefinition = this.getDocumentDefinitionCompra(documento, persona, detalle);

        switch (action) {
            case 'open': pdfMake.createPdf(documentDefinition).open(); break;
            case 'print': pdfMake.createPdf(documentDefinition).print(); break;
            case 'download': pdfMake.createPdf(documentDefinition).download(); break;
            default: pdfMake.createPdf(documentDefinition).open(); break;
        }
    }
    generatePdf(action = 'open', documento, persona, detalle) {
        const documentDefinition = this.getDocumentDefinition(documento, persona, detalle);

        switch (action) {
            case 'open': pdfMake.createPdf(documentDefinition).open(); break;
            case 'print': pdfMake.createPdf(documentDefinition).print(); break;
            case 'download': pdfMake.createPdf(documentDefinition).download(); break;
            default: pdfMake.createPdf(documentDefinition).open(); break;
        }
    }
    private getDocumentDefinitionCompra(documento, persona, detalle) {
        //por mientras retornamos solo el texto
        return {
            //configuraciones
            pageSize: 'A4',
            pageMargins: [20,40,20,40],
            content: [
                //'This is an sample PDF printed with pdfMake',
                {
                    columns: this.columnasDocumento(documento)
                },
                {
                    margin: [0, 20],
                    style: 'tableExample',
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: this.bodyDatosClienteCompra(persona, documento)
                    }
                },
                {
                    margin: [0, 20],
                    style: 'tableExample',
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                        body: this.arrDetalleCompra(detalle, documento)
                    }
                },
                //NUMERO A LETRAS
                {
                    text: 'SON: ' + this.entregaLetras(documento) 
                    //style: 'header'
                },
                //CANCELADO
                {
                    margin: [0, 10],
                    text: 'CANCELADO _____________ DE ___________________________ DEL _____________',
                    style: 'negrita'
                },
                //FIRMA
                {
                    margin: [0, 15],
                    text: 'Nombre ________________________________________________________________________ R.U.T. _________________________\n\n'+
                          'Fecha______________________________ Recinto:_______________________________ Firma: ______________________________',
                    style: ['quote', 'small']
                        
                },

                
            ],
            styles: {
                nota: {
                    fontSize: 10
                },
                negrita:{
                    bold: true,
                    fontSize: 13
                },
                header: {
                    bold: true,
                    fontSize: 15
                },
                grande: {
                    bold: true,
                    fontSize: 18
                },
                tableExample: {
                    margin: [0, 0, 0, 0]
                },
                quote: {
                    italics: true
                },
                small: {
                    fontSize: 8
                }
            },
            defaultStyle: {
                fontSize: 12
            }
        }
    }
    private arrDetalleCompra(detalle, documento){
        var header = [ {
            fillColor: '#eeeeee',
            text: 'ARTICULO',
            alignment: 'center'
        }, 
        {
            fillColor: '#eeeeee',
            text: 'DESCRIPCIÓN',
            alignment: 'center'
        }, 
        {
            fillColor: '#eeeeee',
            text: 'VOLUMEN',
            alignment: 'center'
        },
        {
            fillColor: '#eeeeee',
            text: 'PRECIO UNITARIO',
            alignment: 'center'
        }, 
        {
            fillColor: '#eeeeee',
            text: 'SUBTOTAL',
            alignment: 'center'
        }];
        var retorno = ['', '', '', '', '', ''];
        var arreglo = [];
        arreglo.push(header);
        
        
        if (detalle && detalle.length > 0){
            detalle.forEach(elem => {
                //CurrencyFormat
                var preDetail = this.formatMoney(elem.PreDetall, 0,',','.');
                var netDetail = this.formatMoney(this.subtotalDetalle(elem), 0,',','.');
                var linea = [];
                linea.push(elem.ProDetall);
                linea.push(elem.NomProduc);
                linea.push(elem.VolDetall.toString());
                //formatear
                linea.push(preDetail);
                linea.push(netDetail);
                arreglo.push(linea);
            });
        }
        var valorNeto = this.sumarNetos(detalle);
        var valorTotal = documento.ValFactur;
        var valorIva = this.calculaImpuesto(documento.ValFactur, valorNeto);
        var neto = [{
            border: [false, false, true, false],
            text: 'NETO', 
            style: 'negrita', 
            colSpan: 4, 
            alignment: 'right'
        }, {},{},{}, {text: this.formatMoney(valorNeto, 0,',','.'), style: 'negrita', alignment: 'center'}];
        var iva = [{
            border: [false, false, true, false],
            text: 'IVA', 
            style: 'negrita', 
            colSpan: 4, 
            alignment: 'right'
        }, {},{},{}, {text: this.formatMoney(valorIva, 0,',','.'), style: 'negrita', alignment: 'center'}];
        var total = [{
            border: [false, false, true, false],
            text: 'TOTAL', 
            style: 'negrita', 
            colSpan: 4, 
            alignment: 'right'
        }, {},{},{}, {text: this.formatMoney(valorTotal, 0,',','.'), style: 'negrita', alignment: 'center'}];
        arreglo.push(neto);
        arreglo.push(iva);
        arreglo.push(total);

        //var numeroLetras = this.utiles.numeroALetras(valorTotal);
        //console.log(numeroLetras);
        return arreglo;
    }

    subtotalDetalle(detalle){
        var unitario = parseFloat(detalle.PreDetall);
        var cantidad = parseFloat(detalle.VolDetall);
        var retorno = 0;
        if (unitario > 0 && cantidad > 0){
          retorno = Math.floor(unitario * cantidad);
        }
        return retorno;
      
      }
    private getDocumentDefinition(documento, persona, detalle) {
        //por mientras retornamos solo el texto
        return {
            //configuraciones
            pageSize: 'A4',
            pageMargins: [20,40,20,40],
            content: [
                //'This is an sample PDF printed with pdfMake',
                {
                    columns: this.columnasDocumento(documento)
                },
                {
                    margin: [0, 20],
                    style: 'tableExample',
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: this.bodyDatosCliente(persona, documento)
                    }
                },
                {
                    margin: [0, 20],
                    style: 'tableExample',
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
                        body: this.arrDetalle(detalle, documento)
                    }
                },
                //NUMERO A LETRAS
                {
                    text: 'SON: ' + this.entregaLetras(documento) 
                    //style: 'header'
                },
                //nota
                {
                    margin: [0, 10],
                    text: 'NOTA: IMPORTANTE ESTA FACTURA DEBE SER CANCELADA EN EL PLAZO CONVENIDO DE LO CONTRARIO SE RECARGARÁ EN UN ______ % DE INTERÉS MENSUAL.',
                    style: 'nota'
                },
                //CANCELADO
                {
                    margin: [0, 10],
                    text: 'CANCELADO _____________ DE ___________________________ DEL _____________',
                    style: 'negrita'
                },
                //FIRMA
                {
                    margin: [0, 15],
                    text: 'Nombre ________________________________________________________________________ R.U.T. _________________________\n\n'+
                          'Fecha______________________________ Recinto:_______________________________ Firma: ______________________________',
                    style: ['quote', 'small']
                        
                },

                
            ],
            styles: {
                nota: {
                    fontSize: 10
                },
                negrita:{
                    bold: true,
                    fontSize: 13
                },
                header: {
                    bold: true,
                    fontSize: 15
                },
                grande: {
                    bold: true,
                    fontSize: 18
                },
                tableExample: {
                    margin: [0, 0, 0, 0]
                },
                quote: {
                    italics: true
                },
                small: {
                    fontSize: 8
                }
            },
            defaultStyle: {
                fontSize: 12
            }
        }
    }
    private entregaLetras(documento){
        var valorTotal = documento.ValFactur;
        return this.utiles.numeroALetras(valorTotal);
    }
    private arrDetalle(detalle, documento){
        var header = [ {
            fillColor: '#eeeeee',
            text: 'ARTICULO',
            alignment: 'center'
        }, 
        {
            fillColor: '#eeeeee',
            text: 'DESCRIPCIÓN',
            alignment: 'center'
        }, 
        {
            fillColor: '#eeeeee',
            text: 'VOLUMEN',
            alignment: 'center'
        },
        {
            fillColor: '#eeeeee',
            text: 'PRECIO UNITARIO',
            alignment: 'center'
        }, 
        {
            fillColor: '#eeeeee',
            text: 'SUBTOTAL',
            alignment: 'center'
        }];
        var retorno = ['', '', '', '', '', ''];
        var arreglo = [];
        arreglo.push(header);
        
        
        if (detalle && detalle.length > 0){
            detalle.forEach(elem => {
                //CurrencyFormat
                var preDetail = this.formatMoney(elem.PreDetall, 0,',','.');
                var netDetail = this.formatMoney(elem.NetDetall, 0,',','.');
                var linea = [];
                linea.push(elem.ProDetall);
                linea.push(elem.NomProduc);
                linea.push(elem.VolDetall.toString());
                //formatear
                linea.push(preDetail);
                linea.push(netDetail);
                arreglo.push(linea);
            });
        }
        var valorNeto = documento.Neto;
        var valorTotal = documento.Total;
        var valorIva = documento.Iva;
        var neto = [{
            border: [false, false, true, false],
            text: 'NETO', 
            style: 'negrita', 
            colSpan: 4, 
            alignment: 'right'
        }, {},{},{}, {text: this.formatMoney(valorNeto, 0,',','.'), style: 'negrita', alignment: 'center'}];
        var iva = [{
            border: [false, false, true, false],
            text: 'IVA', 
            style: 'negrita', 
            colSpan: 4, 
            alignment: 'right'
        }, {},{},{}, {text: this.formatMoney(valorIva, 0,',','.'), style: 'negrita', alignment: 'center'}];
        var total = [{
            border: [false, false, true, false],
            text: 'TOTAL', 
            style: 'negrita', 
            colSpan: 4, 
            alignment: 'right'
        }, {},{},{}, {text: this.formatMoney(valorTotal, 0,',','.'), style: 'negrita', alignment: 'center'}];
        arreglo.push(neto);
        arreglo.push(iva);
        arreglo.push(total);

        //var numeroLetras = this.utiles.numeroALetras(valorTotal);
        //console.log(numeroLetras);
        return arreglo;
    }
    private bodyDetalle(detalle){
        var body =
            //header 
            [
                {
                    text: 'ARTICULO'
                },
                {
                    text: 'DESCRIPCIÓN'
                },
                {
                    text: 'VOLUMEN'
                },
                {
                    text: 'PRECIO UNITARIO'
                },
                {
                    text: 'SUBTOTAL'
                },
            ]
        return body;
    }
    private bodyDatosCliente(cliente, documento){
        var condicion = '';
        if (documento.ConFactur == 'O'){
            condicion = 'CONTADO';
        }
        else{
            condicion = 'CHEQUE';
        }
        var body = [
            //header
            [
                {
                    fillColor: '#eeeeee',
                    text: 'NOMBRE O RAZÓN SOCIAL',
                    colSpan: 2
                },
                {
                    //vacia
                },
                {
                    fillColor: '#eeeeee',
                    text: 'GIRO'
                },
                {
                    fillColor: '#eeeeee',
                    text: 'FECHA EMISIÓN'
                },

            ],
            //datos de la tabla
            [
                //columna 1
                { 
                    text: cliente.NomClient, fontSize: 10, bold: true, colSpan: 2
                },
                //columna 4
                {
                    //vacia
                },
                //columna 2
                {
                    //text: cliente.DirClient + ', ' + cliente.ComClient, fontSize: 10, bold: true 
                    text: cliente.GirClient, fontSize: 10, bold: true 
                },
                //columna 3
                { 
                    //text: condicion,  fontSize: 10, bold: true 
                    text: documento.FeeFactur,  fontSize: 10, bold: true 
                },

            ],
            //header
            [
                {
                    fillColor: '#eeeeee',
                    text: 'DIRECCIÓN'
                },
                {
                    fillColor: '#eeeeee',
                    text: 'COMUNA'
                },
                {
                    fillColor: '#eeeeee',
                    text: 'GUIA'
                },
                {
                    fillColor: '#eeeeee',
                    text: 'RUT CLIENTE'
                }
            ],
            //datos de la tabla
            [
                //columna 1
                { 
                    text: cliente.DirClient, fontSize: 10, bold: true  
                },
                //columna 2
                {
                    text: cliente.ComClient, fontSize: 10, bold: true 
                },
                //columna 3
                { 
                    //text: condicion,  fontSize: 10, bold: true 
                    text: documento.GuiFactur,  fontSize: 10, bold: true 
                },
                //columna 4
                { 
                    //text: condicion,  fontSize: 10, bold: true 
                    text: cliente.RutClient + '-' + cliente.DigClient,  fontSize: 10, bold: true 
                },
            ],
        
        ];
        return body;
    }
    private bodyDatosClienteCompra(cliente, documento){
        var condicion = '';
        if (documento.ConFactur == 'O'){
            condicion = 'CONTADO';
        }
        else{
            condicion = 'CHEQUE';
        }
        var body = [
            //header
            [
                {
                    fillColor: '#eeeeee',
                    text: 'NOMBRE O RAZÓN SOCIAL',
                    colSpan: 2
                },
                {
                    //vacia
                },
                {
                    fillColor: '#eeeeee',
                    text: 'GIRO'
                },
                {
                    fillColor: '#eeeeee',
                    text: 'FECHA EMISIÓN'
                },

            ],
            //datos de la tabla
            [
                //columna 1
                { 
                    text: cliente.NomProved, fontSize: 10, bold: true, colSpan: 2
                },
                //columna 4
                {
                    //vacia
                },
                //columna 2
                {
                    //text: cliente.DirClient + ', ' + cliente.ComClient, fontSize: 10, bold: true 
                    text: cliente.GirProved, fontSize: 10, bold: true 
                },
                //columna 3
                { 
                    //text: condicion,  fontSize: 10, bold: true 
                    text: documento.FeeFactur,  fontSize: 10, bold: true 
                },

            ],
            //header
            [
                {
                    fillColor: '#eeeeee',
                    text: 'DIRECCIÓN'
                },
                {
                    fillColor: '#eeeeee',
                    text: 'COMUNA'
                },
                {
                    fillColor: '#eeeeee',
                    text: 'GUIA'
                },
                {
                    fillColor: '#eeeeee',
                    text: 'RUT PROVEEDOR'
                }
            ],
            //datos de la tabla
            [
                //columna 1
                { 
                    text: cliente.DirProved, fontSize: 10, bold: true  
                },
                //columna 2
                {
                    text: cliente.ComProved, fontSize: 10, bold: true 
                },
                //columna 3
                { 
                    //text: condicion,  fontSize: 10, bold: true 
                    text: documento.GuiFactur,  fontSize: 10, bold: true 
                },
                //columna 4
                { 
                    //text: condicion,  fontSize: 10, bold: true 
                    text: cliente.RutProved + '-' + cliente.DigProved,  fontSize: 10, bold: true 
                },
            ],
        
        ];
        return body;
    }
    private columnasDatosCliente(cliente, documento, detalle){
        var condicion = '';
        if (documento.ConFactur == 'O'){
            condicion = 'CONTADO';
        }
        else{
            condicion = 'CHEQUE';
        }
        var table = {
            widths: ['*', 'auto', 'auto', 'auto'],
            body:[
                //header
                [
                    {
                        fillColor: '#eeeeee',
                        text: 'NOMBRE O RAZÓN SOCIAL',
                        colSpan: 2
                    },
                    {
                        //vacia
                    },
                    {
                        fillColor: '#eeeeee',
                        text: 'GIRO'
                    },
                    {
                        fillColor: '#eeeeee',
                        text: 'FECHA EMISIÓN'
                    },

                ],
                //datos de la tabla
                [
                    //columna 1
                    { 
                        text: cliente.NomClient, fontSize: 10, bold: true, colSpan: 2
                    },
                    //columna 4
                    {
                        //vacia
                    },
                    //columna 2
                    {
                        //text: cliente.DirClient + ', ' + cliente.ComClient, fontSize: 10, bold: true 
                        text: cliente.GirClient, fontSize: 10, bold: true 
                    },
                    //columna 3
                    { 
                        //text: condicion,  fontSize: 10, bold: true 
                        text: documento.FeeFactur,  fontSize: 10, bold: true 
                    },

                ],
                //header
                [
                    {
                        fillColor: '#eeeeee',
                        text: 'DIRECCIÓN'
                    },
                    {
                        fillColor: '#eeeeee',
                        text: 'COMUNA'
                    },
                    {
                        fillColor: '#eeeeee',
                        text: 'GUIA'
                    },
                    {
                        fillColor: '#eeeeee',
                        text: 'RUT CLIENTE'
                    }
                ],
                //datos de la tabla
                [
                    //columna 1
                    { 
                        text: cliente.DirClient, fontSize: 10, bold: true  
                    },
                    //columna 2
                    {
                        text: cliente.ComClient, fontSize: 10, bold: true 
                    },
                    //columna 3
                    { 
                        //text: condicion,  fontSize: 10, bold: true 
                        text: documento.GuiFactur,  fontSize: 10, bold: true 
                    },
                    //columna 4
                    { 
                        //text: condicion,  fontSize: 10, bold: true 
                        text: cliente.RutClient + '-' + cliente.DigClient,  fontSize: 10, bold: true 
                    },
                ],
            
            ]
        }
       return table;
    }
    private columnasDocumento(factura){
        var columns = [];
        var institucion = this.retornaInstitucion();
        var entidadTitulo =  {
            type: 'none',
            ol: [
                { text: institucion.Titulo, style: 'header', alignment: 'center' },
                { text: institucion.Nombre, alignment: 'center', fontSize: 12 },
                { text: 'Giro: ' + institucion.Giro, alignment: 'center', fontSize: 9 },
                { text: institucion.Direccion + ' ' + institucion.Comuna, alignment: 'center', fontSize: 9 },
                { text: 'Telefono:' + institucion.Telefono + '- Fax: ' + institucion.Fax, alignment: 'center', fontSize: 9 },
                { text: 'Email: ' + institucion.CorreoElectronico, alignment: 'center', fontSize: 9 }
            ]
        }
        
        var entidadNombreInstitucion = {
            type: 'none',
            ol: [
                { text: 'R.U.T.-' + institucion.Rut + '-' + institucion.Dv, style: 'grande', alignment: 'center' },
                { text: 'CONTROL INTERNO DE PROUDCTOS', alignment: 'center', fontSize: 12 },
                { text: factura.NumFactur, alignment: 'center', style: 'grande' }
            ]
        }
        
        columns.push(entidadTitulo);
        columns.push(entidadNombreInstitucion);
        return columns;

    }
    private retornaInstitucion(){
        if (sessionStorage.getItem("USER_LOGUED_IN")) {
            var usuarioLogueado = JSON.parse(sessionStorage.getItem("USER_LOGUED_IN"));
            if (usuarioLogueado.AutentificacionUsuario) {
                return usuarioLogueado.Institucion;
            }
        }
    }
    private formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
        try {
            var i : any;
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            const negativeSign = amount < 0 ? "-" : "";

            //let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;

            return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
        } catch (e) {
            console.log(e)
        }
    }
    
    sumarNetos(arrDetalle) {
        var retorno = 0
        if (arrDetalle && arrDetalle.length > 0) {
            arrDetalle.forEach(detalle => {
                retorno = retorno + this.subtotalDetalle(detalle);
            });
        }
        return retorno;
    }
    private calculaImpuesto(total, neto) {
        return parseInt(total) - parseInt(neto);
    }

}