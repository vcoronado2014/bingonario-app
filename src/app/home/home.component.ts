import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder, ValidatorFn, EmailValidator } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrManager } from 'ng6-toastr-notifications';
import { CompleterService, CompleterData } from 'ng2-completer';
import { DataTableDirective } from 'angular-datatables';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatIcon, MatList, MatButton } from '@angular/material';


//Servicios
import { GajicoService, Sorteo } from '../servicios/gajico.service';
import { FlowService } from '../servicios/flow';
import { PayuService } from '../servicios/payu';
import { environment } from '../../environments/environment';
import { UtilesService } from '../servicios/utiles.service';

declare var $: any;
import * as moment from 'moment';
import { SolicitudReembolsoComponent } from '../solicitud-reembolso/solicitud-reembolso.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
//CON PAYU SE DEBE MARCAR EL CARTON PAGADO
//ACA QUEDE
export class HomeComponent implements OnInit, OnDestroy {
  //PARA DETERMINAR SI LA PAGINA ES ESTATICA
  isStatic = environment.HOME_ESTATICO;
  isMobile = false;
  sorteos: Sorteo[] = [];
  loading = false;
  usuario;
  rol;
  isLogged = false;
  //lista de sorteos
  listaSorteos: any = [];
  //para verificar si es admin
  esAdmin = false;
  configuraciones: any;
  //para nueva implementación en base a tarjetas
  term;
  config: any;
  collection = { count: 0, data: [] };
  //sorteos original
  sorteosOriginal: Sorteo[] = [];
  constructor(
    private httpClient: HttpClient,
    private fb: FormBuilder,
    private global: GajicoService,
    private router: Router,
    private toastr: ToastrManager,
    private _vcr: ViewContainerRef,
    public completerService: CompleterService,
    public utiles: UtilesService,
    private activatedRoute: ActivatedRoute,
    private flow: FlowService,
    //private payu: PayuService,
  ) {


  }
  //ACTUALIZAR CARTONES PAYU
  //ACA QUEDE, NO SE ESTAN ACTUALIZANDO LOS CARTONES
  //REVISAR TAMBIEN LA ORDEN_FLOW YA QUE ESTA REGISTGRANDO DATOS VACIOS
  actualizarCartonesPayu(ordenFlow, mensaje){
    var resFlow = ordenFlow;
    if (ordenFlow){
      //necesitamos para hacer roolback sotid, usuid y macids, este ultimo lo enviaremos separados por coma
      var arrCartones = [];
      if (ordenFlow.cartones && ordenFlow.cartones.length > 0){
        var cartonesProcesar = JSON.parse(ordenFlow.cartones);
        cartonesProcesar.forEach(carton => {
          arrCartones.push(carton.MacId.toString());
        });
      }
      var xCartones = arrCartones.toString();
      resFlow.cartones = xCartones;
      resFlow.media = 'Payu';
      //ahora hacemos la llamada
      this.loading = true;
      this.global.postActualizarCartonesCompraObjeto(resFlow).subscribe((res:any)=>{
        this.loading = false;
        if (res){
          //correcto
          this.showToast('success', mensaje, 'Compra', 5000);
        }
        else {
          //incorrecto
          this.showToast('error', 'Ocurrió un error al actualizar la compra', 'Compra', 5000);
        }
        //limpiamos la variable de session
        sessionStorage.removeItem('ORDEN_FLOW');
        sessionStorage.removeItem('PAIS_COMPRANDO');
        this.irInicioCliente();
      },
      error => {
        this.loading = false;
        console.log(error);
        this.showToast('error', 'Ocurrió un error al actualizar la compra', 'Compra', 5000);
        //limpiamos la variable de session
        sessionStorage.removeItem('ORDEN_FLOW');
        sessionStorage.removeItem('PAIS_COMPRANDO');
        //this.irHome();
      }
      )
    }
  }
    //proceso que actualiza los cartones comprados
    actualizarCartones(ordenFlow, mensaje, resFlow){
      if (ordenFlow){
        //necesitamos para hacer roolback sotid, usuid y macids, este ultimo lo enviaremos separados por coma
        var arrCartones = [];
        if (ordenFlow.cartones && ordenFlow.cartones.length > 0){
          var cartonesProcesar = JSON.parse(ordenFlow.cartones);
          cartonesProcesar.forEach(carton => {
            arrCartones.push(carton.MacId.toString());
          });
        }
        var xCartones = arrCartones.toString();
        resFlow.cartones = xCartones;
        resFlow.media = resFlow.paymentData.media;
        //ahora hacemos la llamada
        this.loading = true;
        this.global.postActualizarCartonesCompraObjeto(resFlow).subscribe((res:any)=>{
          this.loading = false;
          if (res){
            //correcto
            this.showToast('success', mensaje, 'Compra', 5000);
          }
          else {
            //incorrecto
            this.showToast('error', 'Ocurrió un error al actualizar la compra', 'Compra', 5000);
          }
          //limpiamos la variable de session
          sessionStorage.removeItem('ORDEN_FLOW');
          this.irInicioCliente();
        },
        error => {
          this.loading = false;
          console.log(error);
          this.showToast('error', 'Ocurrió un error al actualizar la compra', 'Compra', 5000);
          //limpiamos la variable de session
          sessionStorage.removeItem('ORDEN_FLOW');
          //this.irHome();
        }
        )
      }
    }
    //proceso que hace rool back de los
    //sorteos comprados
    roolBackCartones(ordenFlow, mensaje){
      if (ordenFlow){
        //necesitamos para hacer roolback sotid, usuid y macids, este ultimo lo enviaremos separados por coma
        var arrCartones = [];
        if (ordenFlow.cartones && ordenFlow.cartones.length > 0){
          var cartonesProcesar = JSON.parse(ordenFlow.cartones);
          cartonesProcesar.forEach(carton => {
            arrCartones.push(carton.MacId.toString());
          });
        }
        var xCartones = arrCartones.toString();
        //ahora hacemos la llamada
        this.loading = true;
        this.global.postAnularCartonesCompra(xCartones, ordenFlow.nombreCompleto, ordenFlow.email).subscribe((res:any)=>{
          this.loading = false;
          if (res){
            //correcto
            this.showToast('error', mensaje, 'Compra', 5000);
          }
          else {
            //incorrecto
            this.showToast('error', 'Ocurrió un error al anular la compra', 'Compra', 5000);
          }
          //limpiamos la variable de session
          sessionStorage.removeItem('ORDEN_FLOW');
          if (sessionStorage.getItem('PAIS_COMPRANDO')){
            sessionStorage.removeItem('PAIS_COMPRANDO');
          }
          
          //this.irHome();
        },
        error => {
          this.loading = false;
          console.log(error);
          this.showToast('error', 'Ocurrió un error al anular la compra', 'Compra', 5000);
          //limpiamos la variable de session
          sessionStorage.removeItem('ORDEN_FLOW');
          //this.irHome();
        }
        )
      }
    }
    
    //validación del pago, viene desde los params
    validacionPagoPayu(){
      if (sessionStorage.getItem('PAIS_COMPRANDO')){
        var pais =  sessionStorage.getItem('PAIS_COMPRANDO');
        if (pais == 'Colombia'){
          //la variable se usó se debe buscar la información en BD
          //BUSCAMOS LA TRANSACCION
          if (this.usuario.Id > 0){
            //aca debemos buscar las transacciones
            this.loading = true;
            this.global.getTransaccionesUsu(this.usuario.Id).subscribe((data:any)=>{
              this.loading = false;
              //si la trasaccion está hay que eliminarla y enviar mensaje de correcto
              //debería solo existir una
              if (data && data.length > 0){
                var transaccion = data[0];
                var statusInitial = transaccion.StatusInitial;
                var status = this.utiles.determinaTransaccion(statusInitial);
                console.log(transaccion);
                var orden = data[0].OrderTransaction;
                //actualizamos la transaccion para que quede eliminada
                this.loading = true;
                this.global.postTransacciones(orden).subscribe((data:any)=>{
                  var ordenFlow = JSON.parse(sessionStorage.getItem('ORDEN_FLOW'));
                  this.loading = false;
                  //aca todo bien
                  this.showToast(status.Tipo, status.Mensaje, 'Compra', 4000);
                  if (status.Codigo != 4){
                    //hay errores, se debe seguirf con otro proceso
                    this.roolBackCartones(ordenFlow, 'La operación se ha cancelado');
                  }
                  else{
                    //todo ok se redirije a la pagina de tickets
                    //utilizaremos la misma orden de flow
                    this.actualizarCartonesPayu(ordenFlow, 'La operación se ha realizado con éxito.');
                  }
                },
                error => {
                  this.loading = false;
                  //enviar mensaje
                  this.showToast('error', error, 'Error', 4000);
                }
                )
                
              } 
              

              console.log(data);
            },
            error => {
              this.loading = false;
              console.log('error al obtener transacciones ' + error);
            }
            )
          }
        }
      }
    }
    validacionPago() {
      this.activatedRoute.queryParams.subscribe((params) => {
        if (params['operacion']) {
          if (sessionStorage.getItem('ORDEN_FLOW')) {
            //tiene parametro, hay que procesar
            var ordenFlow = JSON.parse(sessionStorage.getItem('ORDEN_FLOW'));
            if (ordenFlow.token){
              this.loading = true;
              this.flow.getStatusOrder(ordenFlow.token).subscribe((res:any)=>{
                this.loading = false;
                if (res){
                  //existe el elemento, por lo tanto se evalua la respuesta
                  switch (res.status){
                    case 1://pendiente de pago
                      console.log('pendiente de pago, rollback de la compra');
                      console.log(ordenFlow);
                      this.roolBackCartones(ordenFlow, 'La operación se ha cancelado');
                      break;
                    case 2: //pagada
                      console.log('Correcto pago, hay que actualizar la compra como pagada. y luego enviarlo a la página de tickets');
                      console.log(ordenFlow);
                      //correcto
                      this.actualizarCartones(ordenFlow, 'La operación se ha realizado con éxito', res);
                      break;
                    case 3: //rechazada
                      console.log('rechazada, rollback de la compra');
                      console.log(ordenFlow);
                      this.roolBackCartones(ordenFlow, 'La operación ha sido rechazada');
                      break;
                    case 4: //anulada
                      console.log('anulada, rollback de la compra');
                      console.log(ordenFlow);
                      this.roolBackCartones(ordenFlow, 'La operación ha sido anulada');
                      break;
                  }
                }
                else {
                  //no existe, mismo caso que el error
                  this.showToast('error', 'Error al obtener la orden de pago', 'Pago', 4000);
                  console.log('cancelar orden de flow y los datos comprados conforme a lo siguiente...');
                  console.log(ordenFlow);
                }
              },
              error => {
                this.showToast('error', 'Error al obtener la orden de pago', 'Pago', 4000);
                console.log('cancelar orden de flow y los datos comprados conforme a lo siguiente...');
                console.log(ordenFlow);
                console.log(error);
                this.loading = false;
              }
              )
            }
          }
        }
        else {
          //aca puede producirse que hizo click en back
          if (sessionStorage.getItem('ORDEN_FLOW')) {
            var ordenFlow = JSON.parse(sessionStorage.getItem('ORDEN_FLOW'));
            if (ordenFlow.token){
              this.loading = true;
              this.flow.getStatusOrder(ordenFlow.token).subscribe((res:any)=>{
                this.loading = false;
                if (res){
                  //existe el elemento, por lo tanto se evalua la respuesta
                  switch (res.status){
                    case 1://pendiente de pago
                      console.log('pendiente de pago, rollback de la compra');
                      console.log(ordenFlow);
                      this.roolBackCartones(ordenFlow, 'La operación se ha cancelado');
                      break;
                    case 2: //pagada
                      console.log('Correcto pago, hay que actualizar la compra como pagada. y luego enviarlo a la página de tickets');
                      console.log(ordenFlow);
                      //correcto
                      this.actualizarCartones(ordenFlow, 'La operación se ha realizado con éxito', res);
                      break;
                    case 3: //rechazada
                      console.log('rechazada, rollback de la compra');
                      console.log(ordenFlow);
                      this.roolBackCartones(ordenFlow, 'La operación ha sido rechazada');
                      break;
                    case 4: //anulada
                      console.log('anulada, rollback de la compra');
                      console.log(ordenFlow);
                      this.roolBackCartones(ordenFlow, 'La operación ha sido anulada');
                      break;
                  }
                }
                else {
                  //no existe, mismo caso que el error
                  this.showToast('error', 'Error al obtener la orden de pago', 'Pago', 4000);
                  console.log('cancelar orden de flow y los datos comprados conforme a lo siguiente...');
                  console.log(ordenFlow);
                }
              },
              error => {
                this.showToast('error', 'Error al obtener la orden de pago', 'Pago', 4000);
                console.log('cancelar orden de flow y los datos comprados conforme a lo siguiente...');
                console.log(ordenFlow);
                console.log(error);
                this.loading = false;
              }
              )
            }
          }
        }
      });
    }
    irInicioCliente() {
      this.router.navigateByUrl('/iniciocliente')
        .then(data => console.log(data),
          error => {
            console.log(error);
          }
        )
    }

  //metodo para limpiar la lista de sorteos
  limpiar() {
    var retorno = [];
    this.term = '';
    retorno = this.sorteosOriginal;
    //pagination
    this.collection.data = retorno;
    this.collection.count = retorno.length;
    //******** fin pagination */
  }
  //DEBO SEGUIR CON ESTA PAGINA
  //MOSTRAR MAS INFORMACION AL CLIENTE
  //SOLUCIONAR EL FILTRO
  //PONER IMAGEN DEL CARTON EN LA LISTA
  //EL BOTON QUE DICE ACTIVO DEBE SER UNA ESPECIE DE INFO NO TAN GRANDE COMO AHORA
  
  ngOnDestroy(): void {

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
  //inicializa config
  inicializaConfig(){
    this.config = {
      itemsPerPage: 6,
      currentPage: 1,
      totalItems: this.collection.count
    };
  }
  openPdf(url) {
    window.open(url, '_blank');
  }
  pageChanged(event){
    this.config.currentPage = event;
  }
  //buscar
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
  transformaEntidad(arrCompras){
    //ojo la fecha de inicio del sorteo debería estar dentro de la fecha actual
    //para poder mostrar el sorteo
    var fechaActual = new Date();
    var retorno = [];
    var indice = 1;
    if (arrCompras && arrCompras.length > 0){
      arrCompras.forEach(element => {
        var urlAfiche = '';
        var urlIcono = '';
        element.indice = indice;
        if (element.Banner && element.Banner != '' && element.Banner != '#' && element.Banner.length > 5){
          urlAfiche = environment.URL_SLIDE + element.Banner;
        }
        element.Banner = urlAfiche;
        if (element.Icono && element.Icono != '' && element.Icono != '#' && element.Icono.length > 5){
          urlIcono = environment.URL_SLIDE + element.Icono;
        }
        else{
          //no hay imagen, se pone por defecto
          urlIcono = '../../assets/images/no-imagen.jpg';
        }
        element.Icono = urlIcono;
        indice++;
        //acá debemos comparar la fecha actual con la de inicio del sorteo
        var fechaInicio = new Date(element.FechaInicio);
        //console.log(this.utiles.ComparaFechas(fechaInicio, fechaActual));
        var difFecha = this.utiles.ComparaFechas(fechaInicio, fechaActual);
        //si valor = -1 correcto, si es 1 o 0 no se puede
/*         var fechaInicio = moment(element.fechaInicio, 'DD/MM/YYYY');
        console.log('fecha inicio: ' + fechaInicio);
        console.log('fecha actual: ' + fechaActual);
        if (fechaInicio >= fechaActual){
          console.log('fecha inicio mayor a fecha actual');
        }
        console.log(moment().diff(fechaInicio, 'day')); */
        if (difFecha == -1){
          retorno.push(element);
        }
      });
    }
    return retorno;
  }
  //init
  ngOnInit() {
    if (sessionStorage.getItem('USER_LOGUED_IN')) {
      this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
      this.isLogged = true;

    }
    if (sessionStorage.getItem('USER_ROL')) {
      this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
      if (this.rol.Id == 1) {
        this.esAdmin = true;
      }
    }
    //DEBEMOS MOSTRAR ALGO CUANDO NO HAYAN SORTEOS
    this.isMobile = this.utiles.EsMobil();
    //console.log(this.isMobile);
    //inicializacion de configuracion
    this.inicializaConfig();
    //**************************** */
    //configuracion inicial
    this.loadConfig();
    //PRUEBAS PAYU
/*     this.pingPayu();
    this.postMediosPagoPayu(); */
    if (!this.isStatic) {
      this.validacionPagoPayu();
      this.validacionPago();
      this.LoadTable();
    }
  }

  comprarSorteo(sorteo) {
    console.log(sorteo);
    //guardamos en una variable de sesion el sorteo que esta comprando
    sessionStorage.setItem('SORTEO_COMPRANDO', JSON.stringify(sorteo));
    if (this.usuario && this.usuario.Id > 0) {
      //esta logueado lo mandamos directo a la pagina
      this.irCompra()
    }
    else {
      //lo enviamos a la página de login
      this.irLogin();
    }
  }
  irLogin() {
    this.router.navigateByUrl('/login')
      .then(data => console.log(data),
        error => {
          console.log(error);
        }
      )
  }
  irCompra() {
    //lo cambiamos por la pagina intermedia cuando tenga payu
    if (environment.USA_PAYU){
      this.router.navigateByUrl('/precompra')
      .then(data => console.log(data),
        error => {
          console.log(error);
        }
      )
    }
    else{
      this.router.navigateByUrl('/comprasorteo')
      .then(data => console.log(data),
        error => {
          console.log(error);
        }
      )
    }

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
  loadConfig(){
    var esProduccion = '0';
    if (environment.production){
      esProduccion = '1';
    }
    else {
      esProduccion = '0';
    }
    this.loading = true;
    this.global.postConfiguraciones(esProduccion).subscribe((res:any)=>{
      //aca debería venir las configuraciones
      localStorage.setItem('CONFIGURACION', JSON.stringify(res));
      this.configuraciones = res;
      this.loading = false;
    }
    , error => {
      console.log(error);
      this.loading = false;
    }
    )
  }
/*   pingPayu(){
    this.loading = true;
    this.payu.postPing().then((data:any)=>{
      console.log(data);
      this.loading = false;
    },
    error =>{
      console.log(error);
      this.loading = false;
    }
    )
  } */
/*   postMediosPagoPayu(){
    this.loading = true;
    this.payu.postMediosPago().then((data:any)=>{
      console.log(data);
      this.loading = false;
    },
    error =>{
      console.log(error);
      this.loading = false;
    }
    )
  } */
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
      //transfromamos la entidad
      this.sorteos = this.transformaEntidad(res.Sorteos);
      this.listaSorteos = this.sorteos;
      //objeto original
      this.sorteosOriginal = this.sorteos;
      //********************************** */
      //pagination de las cards
      this.collection.data = this.sorteos;
      this.collection.count = this.sorteos.length;
      //******** fin pagination */
      console.log(this.sorteos);
      this.loading = false;
    }
    );
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = this.utiles.EsMobil();
  }

}