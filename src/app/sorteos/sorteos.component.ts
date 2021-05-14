import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { merge, Observable, of as observableOf } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ToastrManager } from 'ng6-toastr-notifications';


//servicios

import { GajicoService, Sorteo } from '../servicios/gajico.service';
import { UtilesService } from '../servicios/utiles.service';

//completer
import { CompleterService, CompleterData } from 'ng2-completer';

//dialog
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatIcon, MatList, MatButton } from '@angular/material';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { MatFormField } from '@angular/material/form-field';
import {MatSort} from '@angular/material/sort';
import {MatAccordion} from '@angular/material/expansion';
import {MatChip} from '@angular/material/chips';
import { PdfService } from '../servicios/pdf.service';


declare var $: any;
import * as moment from 'moment';
import swal from 'sweetalert2';

@Component({
    selector: 'app-sorteos',
    templateUrl: './sorteos.component.html',
    styleUrls: ['./sorteos.component.css']
})

export class SorteosComponent implements OnInit  {
  /* displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA); */
  displayedColumns: string[] = ['Numero', 'FechaHoraSorteo', 'Hora', 'Codigo', 'FechaInicio', 'Editar', 'Desactivar', 'TieneCartones', 'Cortesias'];
  dataSource = new MatTableDataSource<Sorteo>();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  sorteos: Sorteo[] = [];

  @ViewChild(MatPaginator, {static: true}) paginatorS: MatPaginator;
  @ViewChild(MatAccordion, {static: true}) accordion: MatAccordion;

    loading = false;
    usuario;
    ///sorteos: Observable<Sorteo[]>;
    //mobile
    isMobile = false;
    sorteoMostrando: any = {
      Numero: 0
    };
    term;

    config: any;
    collection = { count: 0, data: [] };
    //sorteos original
    sorteosOriginal: Sorteo[] = [];


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
        
    ) {
      this.dataSource = new MatTableDataSource(this.sorteos);
      this.dataSource.paginator = this.paginator;
      console.log(this.dataSource);

    }

  limpiar() {
    var retorno = [];
    this.term = '';
    retorno = this.sorteosOriginal;
    //pagination
    this.collection.data = retorno;
    this.collection.count = retorno.length;
    //******** fin pagination */
  }
  buscar() {
    var retorno = [];
    if (this.term == '' || this.term == undefined){
      //si esta vacio retornamos la lista original
      retorno = this.sorteosOriginal;
    }
    else{
      if (this.sorteos && this.sorteos.length > 0){
        this.sorteos.forEach(sorteo => {
          var fechaSorteo = moment(sorteo.FechaHoraSorteo).format("dddd, DD MMMM YYYY").toUpperCase();
          var hora = moment(sorteo.FechaHoraSorteo).format("HH:mm");
          //console.log(fechaSorteo.toUpperCase());
          if (
            sorteo.Codigo.toUpperCase().includes(this.term.toUpperCase()) ||
            sorteo.Numero == parseInt(this.term) ||
            fechaSorteo.includes(this.term.toUpperCase()) ||
            hora.includes(this.term)
          
          ){
            //console.log(sorteo);
            retorno.push(sorteo);
          }
        });
      }
    }
    //pagination
    this.collection.data = retorno;
    this.collection.count = retorno.length;
          //******** fin pagination */
    console.log(retorno);

    //return retorno;

  }
    
    editarSorteo(id) {
      var esNUevo = false;
      console.log(id);
      if (id == 0){
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
      moment.locale('es');
      if (sessionStorage.getItem('USER_LOGUED_IN')){
        this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
      }
      this.config = {
        itemsPerPage: 3,
        currentPage: 1,
        totalItems: this.collection.count
      };
      this.isMobile = this.utiles.EsMobil();
      console.log(this.isMobile);
      this.LoadTable();
      this.dataSource.paginator = this.paginator;
      console.log(this.dataSource);
    }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  postSorteos(){
    const headers = new Headers;
    const body = JSON.stringify(
      {
        ReuId: '1'
      }
    );
    headers.append('Access-Control-Allow-Origin', '*');
    let url = environment.API_ENDPOINT + 'Sorteo';
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    httpHeaders.set('Access-Control-Allow-Origin', '*');
    let options = { headers: httpHeaders };

    return this.httpClient.post<Sorteo>(url, body, options);
  }
  listarCartones(sorteo){
   this.router.navigate(['cartones'], {
      queryParams: {
        Id: sorteo.Numero
      }
    })
  }

  listarCartonesAnulados(sorteo){
    console.log('cartones anulados');
    this.router.navigateByUrl('/cartonesanulados')
    .then(data => console.log(data),
      error => {
        console.log(error);
      }
    )
   }

   reporteDetalladoVentas(sorteo){
    console.log('reporte detallado');
    this.router.navigate(['reportedetalladoventas'], {
      queryParams: {
        Id: sorteo
      }
    })
   }
  reenviarPdf(carton){
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
  mostrarCartones(sorteo){
    this.sorteoMostrando = sorteo;
    console.log(this.sorteoMostrando);

  }
  comprarCortesias(sorteo){
    console.log(sorteo);
    sessionStorage.setItem('SORTEO_COMPRANDO_CORTESIA', JSON.stringify(sorteo));
    this.router.navigateByUrl('/crearcortesia')
    .then(data => console.log(data),
      error => {
        console.log(error);
      }
    )
    
  }

  desactivarSorteo(sorteo){
    //antes de desactivar debemos validar un par de reglas de negocio
    var fechaActual = moment();
    var fechaSorteo = moment(sorteo.FechaHoraSorteo);
    var cartonesVendidos = sorteo.CartonesUsados;
    if (fechaActual < fechaSorteo && cartonesVendidos > 0){
      console.log('NO se puede desactivar');
      this.showToast('warning', 'NO se puede cerrar el sorteo ya que la fecha de sorteo es mayor a la actual y cuenta con cartones vendidos, si quieres puedes anularlo', 'Desactivar', 5000);
      return;
    }

    swal.fire(
      {
        title: '¿Estás seguro de desactivar?',
        text: 'Se quitará del listado.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'SI, QUIERO DESACTIVAR!',
        cancelButtonText: 'NO, CANCELAR TODO!',
      }
    ).then((value) => {
      if (value.dismiss) {
        //swal.fire('Cancelado');
      }
      else{
        //console.log(retorno);
        //lo comentamos para pruebas
        this.loading = true;
        this.gajico.postDesactivarSorteo(sorteo.Id).subscribe((data: any) => {
          this.sorteos = this.transformaEntidad(data.Sorteos);
          //objeto original
          this.sorteosOriginal = this.sorteos;
          //********************************** */
          this.dataSource = new MatTableDataSource(this.sorteos);
          this.dataSource.paginator = this.paginator;
          //pagination
          this.collection.data = this.sorteos;
          this.collection.count = this.sorteos.length;
        },
          err => {
            console.log(err);
            this.loading = false;
            this.showToast('error', err, 'Error', 5000);
          },
          () => {
            //correcto
            this.loading = false;
            this.showToast('success', 'Desactivado con éxito', 'Sorteo', 3000);
          }
        )
      }
    });
  }
  anularSorteo(id){
    swal.fire(
      {
        title: '¿Estás seguro de anular?',
        text: 'Se anulará el sorteo seleccionado.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'SI, QUIERO ANULAR!',
        cancelButtonText: 'NO, CANCELAR TODO!',
      }
    ).then((value) => {
      if (value.dismiss) {
        //swal.fire('Cancelado');
      }
      else{

        console.log(id);
        this.loading = true;
        this.gajico.postAnularSorteo(id).subscribe((data: any) => {
          this.sorteos = this.transformaEntidad(data.Sorteos);
          //objeto original
          this.sorteosOriginal = this.sorteos;
          //********************************** */
          this.dataSource = new MatTableDataSource(this.sorteos);
          this.dataSource.paginator = this.paginator;
          //pagination
          this.collection.data = this.sorteos;
          this.collection.count = this.sorteos.length;
        },
          err => {
            console.log(err);
            this.loading = false;
            this.showToast('error', err, 'Error', 5000);
          },
          () => {
            //correcto
            this.loading = false;
            this.showToast('success', 'Sorteo anulado con éxito', 'Sorteo', 3000);
          }
        ) 
      }
    });
  }
  transformaEntidad(arrCompras){
    var retorno = [];
    if (arrCompras && arrCompras.length > 0){
      arrCompras.forEach(element => {
        var urlAfiche = '';
        if (element.Banner && element.Banner != '' && element.Banner != '#' && element.Banner.length > 5){
          urlAfiche = environment.URL_SLIDE + element.Banner;
        }
        element.Banner = urlAfiche;
        retorno.push(element);
        
      });
    }
    return retorno;
  }
  LoadTable() {
    
    this.loading = true;

    const headers = new Headers;
    const body = JSON.stringify(
      {
        ReuId: '1'
      }
    );
    headers.append('Access-Control-Allow-Origin', '*');
    let url = environment.API_ENDPOINT + 'Sorteo';
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    httpHeaders.set('Access-Control-Allow-Origin', '*');
    let options = { headers: httpHeaders };

    this.httpClient.post(url, body, options).subscribe((res: any) => {
      this.sorteos = this.transformaEntidad(res.Sorteos);
      //objeto original
      this.sorteosOriginal = this.sorteos;
      //********************************** */
      this.dataSource = new MatTableDataSource(this.sorteos);
      this.dataSource.paginator = this.paginator;
      //pagination
      this.collection.data = this.sorteos;
      this.collection.count = this.sorteos.length;
      //******** fin pagination */
      console.log(this.dataSource);
      console.log(this.sorteos);
      this.loading = false;
    }
    );
  }
  pageChanged(event){
    this.config.currentPage = event;
  }

  showToast(tipo, mensaje, titulo, tiempo){
    if (tiempo == null){
      tiempo = 5000;
    }
    if (tipo == 'success'){
      this.toastr.successToastr(mensaje, titulo, {
        toastTimeout: tiempo
      });
    }
    if (tipo == 'error'){
      this.toastr.errorToastr(mensaje, titulo,{
        toastTimeout: tiempo
      });
    }
    if (tipo == 'info'){
      this.toastr.infoToastr(mensaje, titulo, {
        toastTimeout: tiempo
      });
    }
    if (tipo == 'warning'){
      this.toastr.warningToastr(mensaje, titulo,{
        toastTimeout: tiempo
      });
    }

  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = this.utiles.EsMobil();
    console.log(this.isMobile);
    if (this.isMobile == false){
      //this.destroyTable();
      //this.LoadTable();
    }

  }

}
