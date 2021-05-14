import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, ElementRef, HostListener, AfterViewInit, TemplateRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { merge, Observable, of as observableOf } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ToastrManager } from 'ng6-toastr-notifications';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

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
import { CompraSorteoComponent } from '../compra-sorteo/compra-sorteo.component';
import { element, error } from 'protractor';

@Component({
  selector: 'app-etickets',
  templateUrl: './etickets.component.html',
  styleUrls: ['./etickets.component.css']
})

export class EticketsComponent implements OnInit {
  modalRef: BsModalRef;
  /* displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA); */
  displayedColumns: string[] = ['Afiche', 'NumeroSorteo', 'FechaHoraSorteo', 'Hora', 'NombreCompleto', 'Valor', 'Detalle'];
  dataSource = new MatTableDataSource<Compra>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  compras: Compra[] = [];
  //sorteos original
  comprasOriginal: Compra[] = [];
  comprasSinFormato = [];
  usuario;
  detalleMostrando = {
    IdSorteoMaestro: 0,
    NumeroSorteo: 0,
    Afiche: '#',
    FechaHoraSorteo: '',
    NombreCompleto: '',
    Email: '',
    Telefono: '',
    Valor: 0,
    EsAnulado: 0,
  };
  cartonReembolso = {
    Afiche: "",
    Email: "",
    EsAnulado: 0,
    EsCortesia: 0,
    EstaCanjeado: 0,
    EstaDisponible: 0,
    EstaPagado: 0,
    FechaHoraSorteo: null,
    IdSorteoMaestro: 0,
    MacId: 0,
    MacIdCanjeado: 0,
    NombreCompleto: "",
    NumeroSorteo: 0,
    PideReembolso: 0,
    Telefono: "",
    UrlEvento: "",
    UrlPdf: "",
    Valor: 0,
    EstadoSorteo: 1
  }

  @ViewChild(MatPaginator, { static: true }) paginatorS: MatPaginator;

  loading = false;
  ///sorteos: Observable<Sorteo[]>;
  //mobile
  isMobile = false;
  sorteoMostrando: any = {
    Numero: 0
  };
  //PARA FILTRAR
  term: string;
  sorteos = [];
  sorteoSelected;
  sorteoOriginal;
  //nueva implementacion tarjetas
  config: any;
  collection = { count: 0, data: [] };

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
    private modalService: BsModalService

  ) {
    this.dataSource = new MatTableDataSource(this.compras);
    this.dataSource.paginator = this.paginator;
    console.log(this.dataSource);
  }
    //inicializa config
    inicializaConfig(){
      this.config = {
        itemsPerPage: 6,
        currentPage: 1,
        totalItems: this.collection.count
      };
    }
  //DEBEMOS SEGUIR CON 2 COSAS, VER LA POSIBILIDAD DE QUITAR UN ELEMENTO DE LA LISTA POR PARTE
  //DEL CLIENTE, POR PARTE DEL CLIENTE TAMBIEN VER LA POSIBILIDAD DE SOLICITAR UN REEMBOLSO
  //EN CASO QUE QUIERA CANCELAR SU CARTON.
  //VER LA FORMA DE MODIFICAR EL BACK END PARA NO ENVIAR CORREOS POR PARAMETRO,
  //VER LA POSIBILIDAD DE MOSTRAR UNA VISTA REDUCIDA DEL CLIENTE, YA QUE PUEDE
  //TENER VARIOS CARTONES O BIEN AGRUPADA POR SORTEO EN CASO QUE COMPRE POR EJEMPLO 
  //VARIOS CARTONES EN UN SORTEO...
  
  pageChanged(event){
    this.config.currentPage = event;
  }
  canjear() {
    //postCanjear return ture o false
    console.log(this.sorteoOriginal);
    console.log(this.sorteoSelected);
    var idOriginal = this.sorteoOriginal.IdSorteoMaestro;
    var idNuevo = this.sorteoSelected;
    var macId = this.sorteoOriginal.MacId;
    var retorno = false;
    this.loading = true;
    this.gajico.postCanjear(idOriginal, idNuevo, macId).subscribe((res:any)=>{
      if (res){
        retorno = res;
      }
    },
    error => {
      console.log(error);
      this.loading = false;
      this.showToast('error', 'Ocurrió un error al canjear el sorteo, consulte al Administrador', 'Canjear', 5000);
    },
    ()=>{
      console.log('correcto');
      this.loading = false;
      if (retorno){
        this.showToast('success', 'Sorteo canjeado con éxito', 'Canjeado', 4000);
        //volvemos a cargar la lista
        this.LoadTableCompras();
      }
      else{
        this.showToast('error', 'Ocurrió un error al canjear el sorteo, consulte al Administrador', 'Canjear', 5000);
      }
    }
    )
    this.modalRef.hide();
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

  buscarSorteo(template: TemplateRef<any>, sorteo) {
    this.sorteoOriginal = sorteo;
    var arr = [];
    this.loading = true;
    this.gajico.postSorteos().subscribe((res: any) => {
      if (res.Sorteos){
        res.Sorteos.forEach(element => {
          if (element.Numero != sorteo.NumeroSorteo && element.ValorSorteo == sorteo.Valor
            && element.EsAnulado == 0 && element.CartonesUsados < element.CartonesDisponibles){
            //agregar
            arr.push(element);
          }
        });
      }
      console.log(arr);
      this.sorteos = arr;
      this.loading = false;
      //levantar el modal
      this.modalRef = this.modalService.show(template);
      
    })
    //console.log(arr);
  }

  buscar() {
    var retorno = [];
    if (this.term == '' || this.term == undefined){
      //si esta vacio retornamos la lista original
      retorno = this.comprasOriginal;
    }
    else{
      if (this.compras && this.compras.length > 0){
        this.compras.forEach(compra => {
          var fechaSorteo = moment(compra.FechaHoraSorteo).format("dddd, DD MMMM YYYY").toUpperCase();
          var hora = moment(compra.FechaHoraSorteo).format("HH:mm");
          //console.log(fechaSorteo.toUpperCase());
          if (
            compra.EstadoStr.toUpperCase().includes(this.term.toUpperCase()) ||
            compra.NumeroSorteo == parseInt(this.term) ||
            fechaSorteo.includes(this.term.toUpperCase()) ||
            hora.includes(this.term)
          
          ){
            //console.log(sorteo);
            retorno.push(compra);
          }
        });
      }
    }
    //pagination
    this.collection.data = retorno;
    this.collection.count = retorno.length;
    //******** fin pagination */
    console.log(retorno);
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('USER_LOGUED_IN')) {
      this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
    }
    this.isMobile = this.utiles.EsMobil();
    //inicializacion de configuracion
    this.inicializaConfig();
    //**************************** */
    console.log(this.isMobile);
    this.LoadTableCompras();
    this.dataSource.paginator = this.paginator;
    console.log(this.dataSource);
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
  postSorteos() {
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
  mostrarCartones(sorteo) {
    this.sorteoMostrando = sorteo;
    console.log(this.sorteoMostrando);
  }
  limpiar() {
    var retorno = [];
    this.term = '';
    retorno = this.comprasOriginal;
    //pagination
    this.collection.data = retorno;
    this.collection.count = retorno.length;
    //******** fin pagination */
  }

  LoadTableCompras() {
    var usuId = this.usuario.Id.toString();
    this.loading = true;
    //aca tengo un problema, ya que está mostrando todos los cartones, no solo del cliente
    //revisar la api............
    this.gajico.getComprasSorteos(usuId, '0', '0').subscribe((res: any) => {
      this.comprasSinFormato = res;
      this.compras = this.transformaEntidad(res);
      //objeto original
      this.comprasOriginal = this.compras;
      //********************************** */
      //this.transformaEntidad(res);
      this.dataSource = new MatTableDataSource(this.compras);
      this.dataSource.paginator = this.paginator;
      //********************************** */
      //pagination de las cards
      this.collection.data = this.compras;
      this.collection.count = this.compras.length;
      //******** fin pagination */
      console.log(this.dataSource);
      console.log(this.comprasSinFormato);
      this.loading = false;
    });
  }
  irPruebasCompra(){
    this.router.navigateByUrl('/pruebascompra')
    .then(data => console.log(data),
      error => {
        console.log(error);
      }
    )
  }
  transformaEntidad(arrCompras) {
    var fechaActual = new Date();
    var retorno = [];
    if (arrCompras && arrCompras.length > 0) {
      arrCompras.forEach(element => {
        var urlAfiche = '';
        if (element.Afiche && element.Afiche != '' && element.Afiche != '#' && element.Afiche.length > 5) {
          urlAfiche = environment.URL_SLIDE + element.Afiche;
        }
         var urlIcono = '';
        if (element.Icono && element.Icono != '' && element.Icono != '#' && element.Icono.length > 5) {
          urlIcono = environment.URL_SLIDE + element.Icono;
        }
        else{
          //no hay imagen, se pone por defecto
          urlIcono = '../../assets/images/no-imagen.jpg';
        } 
        if (element.UrlPdf && element.UrlPdf != '') {
          element.UrlPdf = environment.URL_PDF_HOME + element.UrlPdf;
        }
        element.Icono = urlIcono;
        element.Afiche = urlAfiche;
        //debemos marcar los cartones como terminados o en uso de acuerdo
        //a la fecha de sorteo
        var fechaSorteo = new Date(element.FechaHoraSorteo);
        var difFecha = this.utiles.ComparaFechas(fechaSorteo, fechaActual);
        //si valor = -1 correcto, si es 1 o 0 no se puede
        switch (difFecha) {
          case -1:
            element.EstadoStr = 'Cerrado';
            break;
          case 1:
          case 0:
            element.EstadoStr = 'Abierto';
            break;
          default:
            element.EstadoStr = 'Cerrado';
            break;
        }
        retorno.push(element);

      });
    }
    return retorno;
  }
  verDetalle(detalle) {
    //this.detalleMostrando = null;
    if (detalle) {
      this.detalleMostrando = detalle;
      console.log(this.detalleMostrando);
    }
  }
  openPdf(url) {
    window.open(url, '_blank');
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
  //pedir reembolso
  pedirReembolso(carton){
    this.router.navigate(['solicitudreembolso'], {
      queryParams: {
        Id: carton.IdSorteoMaestro
      }
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = this.utiles.EsMobil();
    console.log(this.isMobile);
  }

}
