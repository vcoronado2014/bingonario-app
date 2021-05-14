import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, ElementRef, HostListener, AfterViewInit, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { merge, Observable, of as observableOf } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ToastrManager } from 'ng6-toastr-notifications';
//excel
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
//pdf 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
//graficos
import { NgxChartsModule } from '@swimlane/ngx-charts';

//servicios

import { GajicoService, Sorteo, Compra } from '../servicios/gajico.service';
import { UtilesService } from '../servicios/utiles.service';

//completer
import { CompleterService, CompleterData } from 'ng2-completer';

//dialog
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatIcon, MatList, MatButton } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatFormField } from '@angular/material/form-field';
import { MatSort } from '@angular/material/sort';
import { PdfService } from '../servicios/pdf.service';


declare var $: any;
import * as moment from 'moment';
import swal from 'sweetalert2';
import { setDate } from 'ngx-bootstrap/chronos/utils/date-setters';

@Component({
  selector: 'app-reporte-detallado-ventas',
  templateUrl: './reporte-detallado-ventas.component.html',
  styleUrls: ['./reporte-detallado-ventas.component.css']
})

export class ReporteDetalladoVentasComponent implements OnInit {
  displayedColumns: string[] = ['NombreCompleto', 'Email', 'Telefono', 'FechaHoraSorteo', 'Valor', 'Tipo', 'Opciones'];
  displayedTotalColumns = ['VacioUno', 'VacioTres', 'Total','VacioDos', 'totalAmount', 'VacioSeis'];
  dataSource = new MatTableDataSource<Compra>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  sorteosUsuario: Compra[] = [];
  compras: Compra[] = [];
  comprasOriginal: Compra[] = [];

  @ViewChild(MatPaginator, { static: true }) paginatorS: MatPaginator;

  loading = false;
  ///sorteos: Observable<Sorteo[]>;
  //mobile
  isMobile = false;
  sorteoMostrando: any = {
    Numero: 0
  };

  idSorteo = 0;

  tipoBusqueda = [
    {
      Nombre: 'Todos',
      Valor: 0
    },
    {
      Nombre: 'Cortesías',
      Valor: 1
    }
    /*     ,
        {
          Nombre: 'Pagados',
          Valor: 2
        }
        ,
        {
          Nombre: 'No Pagados',
          Valor: 2
        } */
  ];

  tipoBusquedaSelected = 0;
  //sorteo selected
  sorteoSelected = 0;
  sorteoEntidadSelected = {
    Activo: 0,
    Banner: "",
    CartonesCortesia: 0,
    CartonesDisponibles: 0,
    CartonesPagados: 0,
    CartonesUsados: 0,
    Codigo: "Cod-0",
    Detalle: "",
    Eliminado: 0,
    FechaCreacion: "",
    FechaHoraSorteo: "",
    FechaInicio: "",
    FechaTermino: "",
    HoraSorteo: null,
    Icono: "#",
    Id: 0,
    InicioCartones: 0,
    Numero: 0,
    ReuIdCreador: 0,
    Subtitulo: "",
    TerminoCartones: 0,
    TieneCartones: 0,
    Titulo: "",
    TotalVendido: 0,
    ValorSorteo: 0,
    EsAnulado: 0
  };
  usuario;
  rol;
  //filtro
  tipoSeleccionado = 0;
  //graficos
  single: any = [{
    name: 'Ventas',
    value: 10
  },
  {
    name: 'Cortesías',
    value: 5
  }];
  //view: any[] = [200, 100];
  singleBarra: any = [{
    name: 'Ventas',
    value: 10
  },
  {
    name: 'Cortesías',
    value: 5
  }];

  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  legendPosition: string = 'below';

  colorScheme = {
    domain: ['#5AA454', '#A10A28']
  };
  colorSchemeTotal = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#FF69B4', '#DA70D6', '#A9A9A9']
  }
  showXAxis = true;
  showYAxis = true;
  showXAxisLabel = false;
  xAxisLabel = 'Fechas';
  showYAxisLabel = true;
  yAxisLabel = 'Total $';

  constructor(
    private httpClient: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private gajico: GajicoService,
    private toastr: ToastrManager,
    public completerService: CompleterService,
    public utiles: UtilesService,
    public dialog: MatDialog,
    private _vcr: ViewContainerRef,
    public pdf: PdfService,
    private elementRef: ElementRef,
    private activatedRoute: ActivatedRoute

  ) {
    //Object.assign(this, { Compra });
    this.activatedRoute.queryParams.subscribe((params) => {
      this.idSorteo = parseInt(params['Id']);
      console.log(params['Id']);
      //buscar los cartones por id sorteo
      //esto hay que cambiarlo depués
      this.dataSource = new MatTableDataSource(this.compras);
      //this.dataSource = new MatTableDataSource(this.comprasOriginal);
      this.dataSource.paginator = this.paginator;
      console.log(this.dataSource);
      
    });
  }
  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
  SetDate(fecha){
    var fechaStr = '';
    //debemos comprobar que la fecha venga en el formato correcto ya que para florence viene 22-02-2020 y rayen "2020-06-15T18:07:39.093"
    if (fecha){
      if (fecha.length > 11){
        //es formato de fecha
        var d = new Date(fecha), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear(),
          hour = '' + d.getHours(), minutes = '' + d.getMinutes();
        
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        if (hour.length < 2) hour = '0' + hour;
        if (minutes.length < 2) minutes = '0' + minutes;

        return day +'-' + month + '-' + year.toString() + ' ' + hour + ':' + minutes;
      }
    }
    return fechaStr;
  }
  generatePdf() {
    //ver esto https://www.npmjs.com/package/jspdf, no c arga el contenido no existe autotable https://github.com/MrRio/jsPDF
    //ojo me falta el margen de autotable
    let doc = new jsPDF();

    let data = [];
    const displayedColumns = ['NombreCompleto', 'Email', 'Telefono', 'FechaHoraSorteo', 'Valor', 'Tipo']

    this.compras.forEach(obj => {
      let arr = [];
      this.displayedColumns.forEach(col => {
        arr.push(obj[col]);
      });
      data.push(arr);
    });
    doc.text('Información Detallada de ventas', 15, 10);
    doc.setFontSize(12);
    doc.text('Usuario: ' + this.usuario.NombreCompleto, 15, 20);
    doc.text('Fecha: ' + new Date().toLocaleDateString(), 15, 30);
    
     autoTable(doc, {
      head: [['NombreCompleto', 'Email', 'Telefono', 'FechaHoraSorteo', 'Valor', 'Tipo']],
      body: data,
      margin: { top: 40 }
    }); 
    doc.save('table.pdf')
  }
  generateExcel(){
    var detalle = this.compras;
    const title = ["Información detallada de Ventas"];
    const usuario = ["Usuario", this.usuario.NombreCompleto];
    const fecha = ["Fecha", new Date().toLocaleDateString()];
    const header = ['NombreCompleto', 'Email', 'Telefono', 'FechaHoraSorteo', 'Valor', 'Tipo'];
    var nuevaData = [];
    if (detalle){
      detalle.forEach(detall => {
        var entidad = [
          detall.NombreCompleto,
          detall.Email,
          detall.Telefono,
          detall.FechaHoraSorteo,
          detall.Valor,
          detall.Tipo
        ];
        nuevaData.push(entidad);
        
      });
    }

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Detalle');

    let titleRow = worksheet.addRow(title);
    worksheet.mergeCells('A1:F1');
    titleRow.font = {'name': 'Calibri', bold: true, size: 14 };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

    let usuarioRow = worksheet.addRow(usuario);
    usuarioRow.font = {'name': 'Calibri', bold: true, size: 12 };
    let fechaRow = worksheet.addRow(fecha);

    //Blank Row 
    worksheet.addRow([]);
    let headerRow = worksheet.addRow(header);

    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'f5f5f5' },
        bgColor: { argb: 'fa8072' }
      }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    })
    // Add Data and Conditional Formatting
    nuevaData.forEach(d => {
      let row = worksheet.addRow(d);
    }
    );

    worksheet.getColumn(1).width = 60;
    worksheet.getColumn(2).width = 50; 
    worksheet.getColumn(3).width = 25; 
    worksheet.getColumn(4).width = 30; 
    worksheet.getColumn(5).width = 35; 
    worksheet.getColumn(6).width = 30; 
    worksheet.addRow([]);

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'Detalle_Bingonario_sorteo_' + this.idSorteo.toString() + '_' + moment().format('HHmm') +'.xlsx');
    })

  }
  getTotalCost() {
    return this.compras.map(t => t.Valor).reduce((acc, value) => acc + value, 0);
  }
  onChangeTipo(event){
    console.log(event.target.value);
    if (event.target.value){
      this.loading = true;
      if (event.target.value == 0){
        //todos
        this.dataSource = new MatTableDataSource(this.comprasOriginal);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      }
      if (event.target.value == 1){
        //solo las ventas
        var arr = [];
        this.compras = this.comprasOriginal;
        this.compras.forEach(compra => {
          if (compra.EsCortesia == 0){
            arr.push(compra);
          }
          
        });
        this.compras = arr;
        this.dataSource = new MatTableDataSource(this.compras);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      }
      if (event.target.value == 2){
        //solo las cortesias
        var arr = [];
        this.compras = this.comprasOriginal;
        this.compras.forEach(compra => {
          if (compra.EsCortesia == 1){
            arr.push(compra);
          }
          
        });
        this.compras = arr;
        this.dataSource = new MatTableDataSource(this.compras);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
      }
    }
  }

  editarSorteo(id) {
    var esNUevo = false;
    console.log(id);
    if (id == 0) {
      esNUevo = true;
    }
    this.router.navigate(['editarsorteo'], {
      queryParams: {
        Id: id,
        EsNuevo: esNUevo
      }
    })
  }
  ngOnInit(): void {
    this.isMobile = this.utiles.EsMobil();
    if (sessionStorage.getItem('USER_LOGUED_IN')) {
      this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
    }
    if (sessionStorage.getItem('USER_ROL')) {
      this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
    }
    //paginator
    this.traslatePaginator();
    this.activatedRoute.queryParams.subscribe((params) => {
      this.idSorteo = parseInt(params['Id']);
      console.log(params['Id']);
      //buscar los cartones por id sorteo
      //esto hay que cambiarlo depués
      //ACÁ QUEDÉ, SE DEBE GENERAR LOS METODOS NECESARIOS PARA BUSCAR LOS CARTONES
      this.LoadTable(this.idSorteo);
      this.dataSource.paginator = this.paginator;
      console.log(this.dataSource);
    });
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  comprarCortesias(sorteo) {
    console.log(sorteo);
    sessionStorage.setItem('SORTEO_COMPRANDO_CORTESIA', JSON.stringify(sorteo));
    this.router.navigateByUrl('/crearcortesia')
      .then(data => console.log(data),
        error => {
          console.log(error);
        }
      )

  }
  traslatePaginator() {
    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Items por página';
      this.paginator._intl.firstPageLabel = 'Primera página';
      this.paginator._intl.lastPageLabel = 'Última página';
      this.paginator._intl.nextPageLabel = 'Siguiente';
      this.paginator._intl.previousPageLabel = 'Anterior';
      this.paginator._intl.getRangeLabel = this.getRangeLabel.bind(this);
      console.log(this.paginator._intl);
    }
  }
  private getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0 || pageSize === 0) {
      return 'No hay';
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return (startIndex + 1).toString() + ' - ' + endIndex.toString() + ' de ' + length.toString();
  }

  openPdf(url) {
    window.open(url, '_blank');
  }

  transformaEntidad(arrCompras) {
    var retorno = [];
    if (arrCompras && arrCompras.length > 0) {
      arrCompras.forEach(element => {
        var urlAfiche = '';
        if (element.Afiche && element.Afiche != '' && element.Afiche != '#' && element.Afiche.length > 5) {
          urlAfiche = environment.URL_SLIDE + element.Afiche;
        }
        if (element.UrlPdf && element.UrlPdf != '') {
          element.UrlPdf = environment.URL_PDF + element.UrlPdf;
        }
        element.Afiche = urlAfiche;
        //transformamos la fecha
        element.FechaOperacion = element.FechaHoraSorteo;
        element.FechaHoraSorteo = moment(element.FechaHoraSorteo).format('DD-MM-YYYY HH:mm');
        //agregamos un nuevo elemento tipo
        if (element.EsCortesia == 1){
          element.Tipo = 'Cortesía';
        }
        else {
          element.Tipo = 'Venta';
        }
        retorno.push(element);

      });
    }
    return retorno;
  }

  reenviarPdf(carton) {
    swal.fire(
      {
        title: '¿Estás seguro de reenviar el cartón?',
        text: 'Elcartón será enviado nuevamente a su correo electrónico.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'SI, QUIERO ENVIAR!',
        cancelButtonText: 'NO, CANCELAR TODO!',
      }
    ).then((value) => {
      if (value.dismiss) {
        //swal.fire('Cancelado');
      }
      else {
        //sotId, usuId, nombreCompleto, email, macId
        var sotId = carton.NumeroSorteo;
        var usuId = this.usuario.Id;
        var nombreCompleto = carton.NombreCompleto;
        var email = carton.Email;
        var macId = carton.MacId;
        this.loading = true;
        this.gajico.postReenviarPdf(sotId, usuId, nombreCompleto, email, macId).subscribe((res: any) => {
          if (res) {
            this.showToast('success', 'Cartón enviado con éxito', 'Reenvío', 3000);
          }
          else {
            this.showToast('error', 'Ocurrió un error al reenviar el correo', 'Reenvío', 4000);
          }
        },
          error => {
            this.loading = false;
            console.log(error);
            this.showToast('error', error, 'Error al reenviar', 5000);
          },
          () => {
            this.loading = false;
            console.log('correcto');
          }
        )
      }
    });
  }

  LoadTable(sotId) {
    this.loading = true;
    var usuId = this.usuario.Id;
    this.gajico.postReporteDetalladoVentas(sotId).subscribe((res: any) => {
      this.compras = this.transformaEntidad(res);
      this.comprasOriginal = this.compras;
      this.dataSource = new MatTableDataSource(this.compras);
      this.dataSource.paginator = this.paginator;
      this.single =  [...this.generateSingleData()];
      this.singleBarra =  [...this.generateSingleBarraData()];
      console.log(this.single);
      console.log(this.dataSource);
      console.log(this.compras);
      this.loading = false;
    })
  }
  generateSingleData(){
    var arr = [];
    console.log(this.single);
    if (this.comprasOriginal && this.comprasOriginal.length > 0){
      var cortesias = 0;
      var ventas = 0;
      this.comprasOriginal.forEach(compras => {
        if (compras.EsCortesia == 1){
          cortesias++;
        }
        else{
          ventas++;
        }
      });
      arr.push({name: 'Ventas', value: ventas});
      arr.push({name: 'Cortesías', value: cortesias});
    }
    return arr;
  }
  generateSingleBarraData(){
    var arr = [];

    var fechaActual = moment();
    var diaSeis = moment(fechaActual).subtract(1, 'days');
    var diaCinco = moment(fechaActual).subtract(2, 'days');
    var diaCuatro = moment(fechaActual).subtract(3, 'days');
    var diaTres = moment(fechaActual).subtract(4, 'days');
    var diaDos = moment(fechaActual).subtract(5, 'days');
    var diaUno = moment(fechaActual).subtract(6, 'days');

    if (this.comprasOriginal && this.comprasOriginal.length > 0){
      var cortesias = 0;
      var ventas = 0;
      var actual = { name: fechaActual.format('DD-MM-YYYY'), value: 0 };
      var seis = { name: diaSeis.format('DD-MM-YYYY'), value: 0 };
      var cinco = { name: diaCinco.format('DD-MM-YYYY'), value: 0 };
      var cuatro = { name: diaCuatro.format('DD-MM-YYYY'), value: 0 };
      var tres = { name: diaTres.format('DD-MM-YYYY'), value: 0 };
      var dos = { name: diaDos.format('DD-MM-YYYY'), value: 0 };
      var uno = { name: diaUno.format('DD-MM-YYYY'), value: 0 };


      this.comprasOriginal.forEach(compras => {
        if (moment(compras.FechaOperacion).format('DD-MM-YYYY') == actual.name){
          actual.value += compras.Valor;
        }
        if (moment(compras.FechaOperacion).format('DD-MM-YYYY') == seis.name){
          seis.value += compras.Valor;
        }
        if (moment(compras.FechaOperacion).format('DD-MM-YYYY') == cinco.name){
          cinco.value += compras.Valor;
        }
        if (moment(compras.FechaOperacion).format('DD-MM-YYYY') == cuatro.name){
          cuatro.value += compras.Valor;
        }
        if (moment(compras.FechaOperacion).format('DD-MM-YYYY') == tres.name){
          tres.value += compras.Valor;
        }
        if (moment(compras.FechaOperacion).format('DD-MM-YYYY') == dos.name){
          dos.value += compras.Valor;
        }
        if (moment(compras.FechaOperacion).format('DD-MM-YYYY') == uno.name){
          uno.value += compras.Valor;
        }
      });
      arr.push(actual);
      arr.push(seis);
      arr.push(cinco);
      arr.push(cuatro);
      arr.push(tres);
      arr.push(dos);
      arr.push(uno);
    }
    return arr;
  }
  filtrar(){
    this.loading = true;
    //proceso de busqueda

  }
  limpiar(){
    this.loading = true;
    this.dataSource = new MatTableDataSource(this.comprasOriginal);
    this.dataSource.paginator = this.paginator;
  }

  showToast(tipo, mensaje, titulo, tiempo) {
    if (tiempo == null) {
      tiempo = 5000;
    }
    if (tipo == 'success') {
      this.toastr.successToastr(mensaje, titulo, {
        toastTimeout: tiempo
      });
    }
    if (tipo == 'error') {
      this.toastr.errorToastr(mensaje, titulo, {
        toastTimeout: tiempo
      });
    }
    if (tipo == 'info') {
      this.toastr.infoToastr(mensaje, titulo, {
        toastTimeout: tiempo
      });
    }
    if (tipo == 'warning') {
      this.toastr.warningToastr(mensaje, titulo, {
        toastTimeout: tiempo
      });
    }

  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = this.utiles.EsMobil();
    console.log(this.isMobile);
    if (this.isMobile == false) {
      //this.destroyTable();
      //this.LoadTable();
    }

  }

}