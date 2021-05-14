import { Component, OnInit, ViewContainerRef, ɵConsole } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder, ValidatorFn, EmailValidator } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrManager } from 'ng6-toastr-notifications';

//Servicios
import { ServicioLoginService } from '../servicios/servicio-login-service';
import { UtilesService } from '../servicios/utiles.service';
import { GajicoService } from '../servicios/gajico.service';
import { FlowService } from '../servicios/flow';
import { PayuService } from '../servicios/payu';
import { environment } from '../../environments/environment';
import * as moment from 'moment';

import * as CryptoJS from 'crypto-js';

//import * as fx from '../../../node_modules/moneyjs/lib/money.js';

@Component({
  selector: 'app-compra-sorteo',
  templateUrl: './compra-sorteo.component.html',
  styleUrls: ['./compra-sorteo.component.css'],

})
export class CompraSorteoComponent implements OnInit {
  configuraciones: any;
  paisComprando: any;
  usuario;
  rol;
  sorteoComprando;
  fotoSorteo;
  esAdmin = false;

  formaSorteo: FormGroup;
  formaComprador: FormGroup;
  loading = false;
  submitted = false;
  resolvedCaptcha = false;
  expCelular = /^(\+?56)?(\s?)(0?9)(\s?)[9876543]\d{7}$/gm;
  expPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/gm;
  expEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/gm;
  //PAYU
  urlCheckPayu: any;
  //variables para usar en el formulario de colombia
  description: any;
  referenceCode: any;
  referenceCodeShort: any;
  amount: any;
  test: any;
  merchantId: any;
  accountId: any;
  buyerEmail= '';
  signature: any;
  buyerFullName: string = '';
  payerPhone: string = '';
  urlConfirmation = environment.URL_CONFRIMATION;
  esPayu = 0;

  constructor(
    private fb: FormBuilder,
    private auth: ServicioLoginService,
    private global: GajicoService,
    private router: Router,
    private toastr: ToastrManager,
    private _vcr: ViewContainerRef,
    private flow: FlowService,
    private activatedRoute: ActivatedRoute,
    private payu: PayuService,
    private utiles: UtilesService
    
  ) {
    //this.toastr.setRootViewContainerRef(_vcr);


  }
  usarMisDatos() {
    if (this.paisComprando == 'Chile'){
      if (this.usuario) {
        this.formaComprador.controls.nuevoNombreCompleto.setValue(this.usuario.NombreCompleto);
        this.formaComprador.controls.nuevoTelefono.setValue(this.usuario.Telefono);
        this.formaComprador.controls.nuevoEmail.setValue(this.usuario.Email);
        this.formaComprador.controls.nuevoRepitaEmail.setValue(this.usuario.Email);
      }
    }
    else{
      if (this.usuario) {
        this.buyerEmail = this.usuario.Email;
        this.payerPhone = this.usuario.Telefono;
        this.buyerFullName = this.usuario.NombreCompleto;
      }
    }
  }
  //ACA QUEDE, YA SE ESTA GUARDANDO EL TIPO DE CAMBIO EN UNA VARIABLE GLOBAL
  //ESE TIPO DE CAMBIO HAY QUE USARLO CON EL FORMULARIO PARA ENVIAR LA SOLICITUD A PAYU
  
  getConverter(){
    if (environment.USA_PAYU) {
      //antes de ir a buscar la info validamos el tiempo del tipo de cambio
      //para no hacer llamadas a cada rato si no cada un día
      var fechaActual = moment();
      var fechaConsulta = moment();
      var consulta = false;

      if (!localStorage.getItem('FECHA_TIPO_CAMBIO')) {
        //si no esta esta variable se debe consultar
        consulta = true;
      }
      else {
        //si esta variable está se debe evaluar la diferencia de tiempo
        var fechaStr = localStorage.getItem('FECHA_TIPO_CAMBIO');
        fechaConsulta = moment(fechaStr);
        //comparar
        var dif = fechaActual.diff(fechaConsulta, 'hours');
        console.log('diferencia: ' + dif);
        if (dif > 24) {
          consulta = true;
        }
      }
      if (consulta) {
        this.payu.getConverter('CLP', 'COP', null).then((res: any) => {
          if (res.data) {
            localStorage.setItem('TIPO_CAMBIO', res.data.CLP_COP);
            localStorage.setItem('FECHA_TIPO_CAMBIO', moment().format('YYYY-MM-DD HH:mm'));
          }
        })
      }
    }
    else{
      console.log('NO USA PAYU');
    }


  }
  ngOnInit() {
    if (environment.USA_PAYU){
      this.urlCheckPayu = environment.URL_WEBCHECK_PAYU;
      this.getConverter();
    }


    //console.log(fiveCol);

    if (sessionStorage.getItem('USER_LOGUED_IN')) {
      this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));

    }
    if (sessionStorage.getItem('USER_ROL')) {
      this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
      if (this.rol.Id == 1) {
        this.esAdmin = true;
      }
    }
    if (sessionStorage.getItem('SORTEO_COMPRANDO')) {
      this.sorteoComprando = JSON.parse(sessionStorage.getItem('SORTEO_COMPRANDO'));
    }
    if (sessionStorage.getItem('PAIS_COMPRANDO')) {
      this.paisComprando = sessionStorage.getItem('PAIS_COMPRANDO');
      if (this.paisComprando != 'Chile'){
        this.esPayu = 1;
      }
    }
    else{
      //si no esta lo creamos
      this.paisComprando = sessionStorage.setItem('PAIS_COMPRANDO', 'Chile');
      this.esPayu = 0;
    }
    if (localStorage.getItem('CONFIGURACION')) {
      this.configuraciones = JSON.parse(localStorage.getItem('CONFIGURACION'));
      if(this.configuraciones.Parametros.EsProduccion == 0){
        this.test = 1
      }
      else{
        this.test = 1;
      }
      console.log(this.configuraciones);
    }
    sessionStorage.removeItem('SORTEO_COMPRANDO');
    console.log(this.sorteoComprando);
    //variables para colombia
    this.merchantId = environment.MERCHANT_ID_PAYU;
    this.accountId = environment.ACCOUNT_ID_PAYU;
    //ahora capturamos el parametro por la url
    this.validacionPago();
    this.cargarForma();
    this.cargarFormaComprador();
  }
  // convenience getter for easy access to form fields
  get f() { return this.formaComprador.controls; }

  onSubmitCol(form){
    //antes de hacer submid hay que guardar algunas variables
    //this.submitted = true;
    console.log(this.formaComprador);
    console.log(this.formaSorteo);
    if (this.formaSorteo.invalid) {
      return;
    }
    //aca seguimos con el proceso de compra
    var correcto = false;
    //creamos la entidad correspondiente para guardar
    var fechaActual = moment().format('YYYYMMDDHHmm');
    //entidad completa al comprar
    var entidadGuardar = {
      ammount: this.formaSorteo.controls.nuevoSubtotal.value,
      currency: 'COP',
      commerceOrder: this.referenceCode,
      payer: $('#buyerEmail').val(),
      requestDate: moment().format('YYYY-MM-DD HH:mm'),
      flowOrder: this.referenceCode,
      nombreCompleto: $('#buyerFullName').val(),
      email: $('#buyerEmail').val(),
      sotId: this.formaSorteo.controls.nuevoNroSorteo.value,
      cantidad: this.formaSorteo.controls.nuevoCantidad.value,
      usuId: this.usuario.Id,
      subtotal: this.formaSorteo.controls.nuevoSubtotal.value,
      producto: this.formaSorteo.controls.nuevoSubtotal.value,
      ordenInterna: this.referenceCode,
      subject: this.description,
      telefono: $('#payerPhone').val(),
      esCortesia: 0,
      token: null,
      payuOrder: null,
      cartones: null,
      pais: this.paisComprando,
    };
    console.log(entidadGuardar);
    //submit form
    this.loading = true;
    this.global.postComprarSorteo(entidadGuardar.sotId, entidadGuardar.cantidad, entidadGuardar.usuId,
      entidadGuardar.nombreCompleto, entidadGuardar.email, entidadGuardar.telefono, entidadGuardar.esCortesia).subscribe(
        (rs: any) => {
          this.loading = false;
          var datos: any = rs;
          //aca debemos validar el mensaje
          if (datos && datos.length > 0) {
            if (!this.esAdmin) {
              //aca en datos viene el arreglo de cartones comprados, hay que guardarlos
              //en conjunto con los datos de compra para despues realizar operaciones 
              //con él, yo gaurdaria la lista completa
              var cartones = JSON.stringify(datos);
              entidadGuardar.cartones = cartones;
              //ahora guardamos el objeto completo
              //siempre y cuando sea de chile la compra ya que utiliza flow
              sessionStorage.setItem('ORDEN_FLOW', JSON.stringify(entidadGuardar));
             
            }
            correcto = true;
          }
          else {
            //incorrecto
            this.showToast('error', 'Error al comprar', 'Compra', 3000);
            console.log('incorrecto');
          }
        },
        er => {
          this.loading = false;
          //console.log('incorrecto' + er);
          this.showToast('error', er, 'Error', 5000);
        },
        () => {
          this.loading = false;
          if (correcto) {
            console.log('Seguir con el proceso de compra');
            //aca deberiamos seguir con el proceso de compra
            //por mientras lo derivamos a inicio de usuario
            if (this.esAdmin) {
              this.showToast('success', 'Compra de cortesía realizada con éxito', 'Compra', 5000);
              this.irInicioAdmin();
            }
            else {
              //aca seguimos con el proceso de pago ahora
              //this.irInicioCliente();
              this.insertarTransaccion(form);
              //this.preProcesoPago(entidadGuardar, this.paisComprando);
            }
          }
          else {
            console.log('error de servidor al comprar');
          }

        }
      );
    

  }
  
  onSubmit() {
    this.submitted = true;
    console.log(this.formaComprador);
    console.log(this.formaSorteo);
    if (this.formaSorteo.invalid || this.formaComprador.invalid) {
      return;
    }
    //aca seguimos con el proceso de compra
    var correcto = false;
    //creamos la entidad correspondiente para guardar
    var fechaActual = moment().format('YYYYMMDDHHmm');
    //entidad completa al comprar
    //aca lo modificamos y lo vendemos como cortesía
    var esCortesia = this.sorteoComprando && this.sorteoComprando.ValorSorteo == 0 ? 1 : 0;
    var entidadGuardar = {
      nombreCompleto: this.formaComprador.controls.nuevoNombreCompleto.value,
      email: this.formaComprador.controls.nuevoEmail.value,
      sotId: this.formaSorteo.controls.nuevoNroSorteo.value,
      cantidad: this.formaSorteo.controls.nuevoCantidad.value,
      usuId: this.usuario.Id,
      subtotal: this.formaSorteo.controls.nuevoSubtotal.value,
      producto: this.formaSorteo.controls.nuevoSubtotal.value,
      ordenInterna: this.usuario.Id.toString() + '-' + this.formaSorteo.controls.nuevoNroSorteo.value.toString() + '-' + fechaActual,
      subject: 'Compra ' + this.formaSorteo.controls.nuevoSubtotal.value,
      telefono: this.formaComprador.controls.nuevoTelefono.value,
      esCortesia: esCortesia,
      token: null,
      flowOrder: null,
      cartones: null,
      pais: this.paisComprando

    };
    if (this.existeComprado(entidadGuardar) == true){
      this.showToast('error', 'Ya tiene un cartón para este sorteo gratuito', 'Compra', 3000);
      return;
    }
    this.loading = true;
    this.global.postComprarSorteo(entidadGuardar.sotId, entidadGuardar.cantidad, entidadGuardar.usuId,
      entidadGuardar.nombreCompleto, entidadGuardar.email, entidadGuardar.telefono, entidadGuardar.esCortesia).subscribe(
        (rs: any) => {
          this.loading = false;
          var datos: any = rs;
          //aca debemos validar el mensaje
          if (datos && datos.length > 0) {
            if (!this.esAdmin) {
              //aca en datos viene el arreglo de cartones comprados, hay que guardarlos
              //en conjunto con los datos de compra para despues realizar operaciones 
              //con él, yo gaurdaria la lista completa
              var cartones = JSON.stringify(datos);
              entidadGuardar.cartones = cartones;
              //ahora guardamos el objeto completo
              //siempre y cuando sea de chile la compra ya que utiliza flow
              if (this.paisComprando == 'Chile' && entidadGuardar.esCortesia == 0){
                sessionStorage.setItem('ORDEN_FLOW', JSON.stringify(entidadGuardar));
              }
            }
            correcto = true;
          }
          else {
            //incorrecto
            this.showToast('error', 'Error al comprar', 'Compra', 3000);
            console.log('incorrecto');
          }
        },
        er => {
          this.loading = false;
          //console.log('incorrecto' + er);
          this.showToast('error', er, 'Error', 5000);
        },
        () => {
          this.loading = false;
          if (correcto) {
            console.log('Seguir con el proceso de compra');
            //aca deberiamos seguir con el proceso de compra
            //por mientras lo derivamos a inicio de usuario
            if (this.esAdmin) {
              this.showToast('success', 'Compra de cortesía realizada con éxito', 'Compra', 5000);
              this.irInicioAdmin();
            }
            else {
              //aca seguimos con el proceso de pago ahora
              //this.irInicioCliente();
              if (entidadGuardar.esCortesia == 0){
                this.preProcesoPago(entidadGuardar, this.paisComprando);
              }
              else{
                //aca ddeberíamos guardar el sorteo encriptado para que no vuelva a comprar 
                //el mismo sorteo con otro usuario
                console.log('encriptar y guardar el registro');
                this.agregaComprado(entidadGuardar);
                this.irInicioCliente();
              }
              
            }
          }
          else {
            console.log('error de servidor al comprar');
          }

        }
      );
      
  }
  existeComprado(entidadGuardar){
    var retorno = false;

    if (localStorage.getItem(this.utiles.encriptarBtoa('COMPRADOS'))){
      var arr = JSON.parse(this.utiles.Desencriptar(localStorage.getItem(this.utiles.encriptarBtoa('COMPRADOS'))));
      if (arr && arr.length > 0){
        for(var i=0; i < arr.length; i++){
          let entidad = arr[i];
          if (entidad.email == entidadGuardar.email && entidad.sotId == entidadGuardar.sotId){
            retorno = true;
          }
        }
      }
    }

    return retorno;
  }
  agregaComprado(entidadGuardar){
    var cartones = JSON.parse(entidadGuardar.cartones);

    var entidad = {
      email: entidadGuardar.email,
      nombreCompleto: entidadGuardar.nombreCompleto,
      sotId: entidadGuardar.sotId,
      carton: cartones && cartones.length > 0 ? cartones[0] : null
    }
    if (!localStorage.getItem(this.utiles.encriptarBtoa('COMPRADOS'))){
      let arr = [];
      arr.push(entidad);
      localStorage.setItem(this.utiles.encriptarBtoa('COMPRADOS'), this.utiles.Encriptar(JSON.stringify(arr)));
    }
    else{
      let arr = JSON.parse(this.utiles.Desencriptar(localStorage.getItem(this.utiles.encriptarBtoa('COMPRADOS'))));
      arr.push(entidad);
      localStorage.setItem(this.utiles.encriptarBtoa('COMPRADOS'), this.utiles.Encriptar(JSON.stringify(arr)));
    }
  }
  //proceso que inserta la transaccion al inicio para que después 
  //el back end actualice los datos de acuerdo a la respuesta
  //de la operación
  insertarTransaccion(form){
    var transaccion = {
      Id: 0,
      OrderTransaction: this.referenceCode,
      UsuId: this.usuario.Id,
      Fecha: moment().format('DD-MM-YYYY HH:mm'),
      StatusInitial: 1,
      StatusName: '',
      EsPayu: this.esPayu,
      Eliminado: 0
    };

    this.loading = true;
    this.global.putTransaccion(transaccion).subscribe((data:any)=>{
      //nada, solo inertamos
      this.loading = false;
      console.log(data);
      //ebviamos el formulario
      form.submit();
    },
    error => {
      this.loading = false;
      console.log('error insertar transaccion ' + error);
    }
    )

  }
  //proceso que obtiene las transacciones pendientes del usuario
  buscaTransaccionesUsu(){
    if (this.usuario.Id > 0){
      //aca debemos buscar las transacciones
      this.loading = true;
      this.global.getTransaccionesUsu(this.usuario.Id).subscribe((data:any)=>{
        this.loading = true;
        console.log(data);
      },
      error => {
        this.loading = false;
        console.log('error al obtener transacciones ' + error);
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
        this.irHome();
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
        this.irHome();
      },
      error => {
        this.loading = false;
        console.log(error);
        this.showToast('error', 'Ocurrió un error al anular la compra', 'Compra', 5000);
        //limpiamos la variable de session
        sessionStorage.removeItem('ORDEN_FLOW');
        this.irHome();
      }
      )
    }
  }
  //validación del pago, viene desde los params
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
  //se guardan token y otros elementos
  preProcesoPago(entidadGuardar, pais){
    if (pais == 'Chile'){
      this.flow.createOrderPost(entidadGuardar.subject, entidadGuardar.subtotal, entidadGuardar.email, entidadGuardar.ordenInterna).subscribe((res: any) => {
        console.log(res);
        if (res && res.token) {
          //guardamos la orden en una variable de sesión por mientras
          entidadGuardar.token = res.token;
          entidadGuardar.flowOrder = res.flowOrder;
          sessionStorage.setItem('ORDEN_FLOW', JSON.stringify(entidadGuardar));
          //AHORA LEVANTAMOS LA URL DE FLOW
          var url = res.url + '?token=' + res.token;
  
          //this.urlToken = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          history.pushState(null, null, location.href);
          history.back();
          history.forward();
  
          window.location.href = url;
  
        }
      },
        error => {
          console.log(error);
        }
      )
    }
    else{
      //es payu, generar el otro proceso

    }

  }
  //deriva a admin
  irInicioAdmin() {
    this.router.navigateByUrl('/sorteos')
      .then(data => console.log(data),
        error => {
          console.log(error);
        }
      )
  }
  //deriva a cliente
  irInicioCliente() {
    this.router.navigateByUrl('/iniciocliente')
      .then(data => console.log(data),
        error => {
          console.log(error);
        }
      )
  }
  irHome() {
    this.router.navigateByUrl('/home')
      .then(data => console.log(data),
        error => {
          console.log(error);
        }
      )
  }
  //vuleve
  cancelar() {
    this.router.navigateByUrl('/home')
      .then(data => console.log(data),
        error => {
          console.log(error);
        }
      )
  }

  cargarForma() {
    var nroSorteo = this.sorteoComprando == null ? 0 : this.sorteoComprando.Numero;
    //dejamos el titulo como producto
    var producto = this.sorteoComprando == null ? '' : this.sorteoComprando.Titulo;
    var precio = this.sorteoComprando == null ? 0 : this.sorteoComprando.ValorSorteo;
    this.fotoSorteo = this.sorteoComprando == null ? '#' : this.sorteoComprando.Banner;
    var subtotal = this.sorteoComprando == null ? 0 : this.sorteoComprando.ValorSorteo;

    this.formaSorteo = new FormGroup({
      'nuevoNroSorteo': new FormControl(nroSorteo, [Validators.required]),
      'nuevoProducto': new FormControl(producto, [Validators.required]),
      'nuevoPrecio': new FormControl(precio, [Validators.required]),
      'nuevoCantidad': new FormControl(1, [Validators.required]),
      'nuevoSubtotal': new FormControl(subtotal, [Validators.required]),

    });
    //desactivamos
    this.formaSorteo.controls.nuevoNroSorteo.disable();
    this.formaSorteo.controls.nuevoProducto.disable();
    this.formaSorteo.controls.nuevoPrecio.disable();
    this.formaSorteo.controls.nuevoSubtotal.disable();
    //variables payu
    this.description = this.formaSorteo.controls.nuevoProducto.value;
    var fechaActual = moment().format('YYYYMMDDHHmm');
    var fechaActualShort = moment().format('YYYYMMDD');
    this.referenceCode = this.usuario.Id.toString() + this.formaSorteo.controls.nuevoNroSorteo.value.toString()  + fechaActual;
    this.referenceCodeShort = this.usuario.Id.toString() + this.formaSorteo.controls.nuevoNroSorteo.value.toString()  + fechaActualShort;
    //aca hay que calcular el valor del producto en pesos colombianos
    var tipoCambio = 0;
    if (localStorage.getItem('TIPO_CAMBIO')){
      tipoCambio = parseFloat(localStorage.getItem('TIPO_CAMBIO'));
    }
    if (subtotal > 0) {
      var precioCol = Math.round(subtotal * tipoCambio);
      this.amount = precioCol;
      this.createSignature(this.amount.toString());
    }


  }
  createSignature(amount){
    //“ApiKey~merchantId~referenceCode~amount~currency”
    var sign = environment.API_KEY_PAYU + '~' + environment.MERCHANT_ID_PAYU + '~' + this.referenceCode + '~' + amount + '~' + 'COP';
    this.signature =  CryptoJS.MD5(sign).toString();
    console.log(sign);
    console.log(this.signature);
  }
  cargarFormaComprador() {

    this.formaComprador = new FormGroup({
      'nuevoNombreCompleto': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]),
      'nuevoEmail': new FormControl('', [Validators.required, Validators.pattern(this.expEmail)]),
      'nuevoRepitaEmail': new FormControl('', [Validators.required]),
      'nuevoTelefono': new FormControl('', [Validators.required, Validators.pattern(this.expCelular)]),
      'nuevoEsChile': new FormControl(true),
    }, { validators: this.EmailIgualesValidator });
    var subtotal = this.sorteoComprando == null ? 0 : this.sorteoComprando.ValorSorteo;
    if (subtotal == 0){
      //es una compra gratuita asi que setean los controles con los datos del usuario logueado
      this.formaComprador.controls.nuevoNombreCompleto.setValue(this.usuario.NombreCompleto);
      this.formaComprador.controls.nuevoEmail.setValue(this.usuario.Email);
      this.formaComprador.controls.nuevoRepitaEmail.setValue(this.usuario.Email);
      this.formaComprador.controls.nuevoTelefono.setValue(this.usuario.Telefono);
      //disabled
      this.formaComprador.controls.nuevoNombreCompleto.disable();
      this.formaComprador.controls.nuevoEmail.disable();
      this.formaComprador.controls.nuevoRepitaEmail.disable();
      this.formaComprador.controls.nuevoTelefono.disable();
    }
    //console.log(this.forma.valid + ' ' + this.forma.status);
  }
  onChangeCantidad(event) {
    console.log(event);
    if (event.target.value) {
      //calculamos subtotal
      var cantidad = parseInt(event.target.value);
      var precio = this.formaSorteo.controls.nuevoPrecio == null ? 0 : this.formaSorteo.controls.nuevoPrecio.value;
      var subtotal = cantidad * precio;
      this.formaSorteo.controls.nuevoSubtotal.setValue(subtotal);
      //calculos para colombia
      var tipoCambio = 0;
      if (localStorage.getItem('TIPO_CAMBIO')){
        tipoCambio = parseFloat(localStorage.getItem('TIPO_CAMBIO'));
      }
      var precioCol = Math.round(subtotal * tipoCambio);
      this.amount = precioCol;
      this.createSignature(this.amount.toString());
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

  EmailIgualesValidator: ValidatorFn = (fg: FormGroup) => {
    const email = fg.get('nuevoEmail').value;
    const emailR = fg.get('nuevoRepitaEmail').value;
    if (email !== null && emailR !== null && email != emailR) {
      this.formaComprador.controls.nuevoRepitaEmail.setErrors({ emailIguales: false });
    }
    return email !== null && emailR !== null && email != emailR ? null : null;
  };
}