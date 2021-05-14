import { Component, OnInit, ViewContainerRef, SecurityContext, TemplateRef, HostListener, DoCheck  } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder, ValidatorFn, EmailValidator } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
//Servicios
import { ServicioLoginService } from '../servicios/servicio-login-service';
import { GajicoService } from '../servicios/gajico.service';
import { FlowService } from '../servicios/flow';
import { environment } from '../../environments/environment';
//crypto js
import * as CryptoJS from 'crypto-js';
import * as moment from 'moment';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-pruebas-compra',
  templateUrl: './pruebas-compra.component.html',
  styleUrls: ['./pruebas-compra.component.css']
})
export class PruebasCompraComponent implements OnInit, DoCheck {
  modalRef: BsModalRef;
  /**
   OJO QUE LOGRE HACER UN REQUEST POR POSTMAN PARA OBTENER LAS ORDENES DE PAGO CON LO SIGUIENTE
   https://sandbox.flow.cl/api/payment/getPayments?apiKey=4E6FFF0A-B357-4509-BA5E-43AAL1B3E32D&date=2020-09-08&s=3034a92f809df4a7a9813e1b79d6b266efe00bd6345f02adc841d9d28ed5972f
   SE OBTUVO ASI
   $params = array( 
  "apiKey" => "4E6FFF0A-B357-4509-BA5E-43AAL1B3E32D",
  "date" => "2020-09-08"
); 
$keys = array_keys($params);
sort($keys);
$toSign = "";
foreach($keys as $key) {
  $toSign .= $key . $params[$key];
};
$signature = hash_hmac('sha256', $toSign , "c221b50487244ab851b38f2fc78fe362273b592c");
echo $signature;

ACA ME RESULTO CON LO SIGUIENTE EL ENVIO

<?php
$params = array( 
  "apiKey" => "4E6FFF0A-B357-4509-BA5E-43AAL1B3E32D",
  "subject" => "pagopruebapostman",
  "currency" => "CLP",
  "amount" => 5000,
  "email" => "vcoronado.alarcon@gmail.com",
  "commerceOrder" => "123456",
  "urlConfirmation" => "https://www.bingonariocoro.cl/respuestacompra",
  "urlReturn" => "https://www.bingonariocoro.cl/respuestacompra"
); 
$keys = array_keys($params);
sort($keys);
$toSign = "";
foreach($keys as $key) {
  $toSign .= $key . $params[$key];
};
echo $toSign;
$signature = hash_hmac('sha256', $toSign , "c221b50487244ab851b38f2fc78fe362273b592c");
echo $signature;

ME ENTREGÓ LA SIGNATURE b76d6c580c24a876c6cf69cb388e511d791ca1d6d417a4ea7e6ca7ce277940b2
    
    

ESTA ES LA URL PARA PHP
http://phptester.net/
   */



  //HAY QUE AGREGAR LA URL DE COMPRA EN EL SORTEO
  //CUANDO SE GUARDE EL PAGO HAY QUE GUARDAR UNA VARIABLE DE SESSION ANTES DE IR A LA PAGINA DE COMPRA DE FLOW
  //CON LOS ANTECEDENTES DE LA COMPRA QUE EL CLIENTE ESTA REALIZANDO
  //SI LUEGO DE QUE FLOW ENVÍE A LA PAGINA RESPUESTACOMPRA
  //SIGNIFICA QUE ESTA TODO OK, Y EN LA PAGINA RESPUESTA COMPRA VERIFICAR SI ESTA ESA VARIABLES DE SESIÓN
  //PARA ELIMINARLA (SE DEBE VER COMO HACER UNICA ESA VARIABLES DE SESION)
  //SI FLOW ENVIA A LA PAGINA ERRORCOMPRA SIGNIFICA QUE HUBO UN ERROR EN LA OPERACIÓN, POR LO TANTO
  //HAY QUE TOMAR LA VARIABLE DE SESION Y DESHACER LA COMPRA EN NUESTRA BASE DE DATOS PARA QUE NO LE 
  //APAREZCA AL CLIENTE Y LUEGO BORRAR LA VARIBALE DE SESSION.
  //HAY QUE PREGUNTAR A LOS SEÑORES DE FLOW, SI ES POSIBLE QUE EL BOTON DE PAGO
  //SIEMPRE CONSIDERE LA CANTIDAD COMO 1 Y QUEDE DESHABILITADO Y SI SE PUEDE PASAR EL EMAIL
  //EN EL MISMO BOTON DE PAGO
    usuario;
    rol;
    urlSorteo = 'https://sandbox.flow.cl/btn.php?token=qcoxcn8&unidades=3';

    sorteoComprando = {
        Activo: 1,
        Banner: "1_banner.png",
        CartonesCortesia: 1,
        CartonesDisponibles: 1499,
        CartonesPagados: 0,
        CartonesUsados: 2,
        Codigo: "COD-1",
        Detalle: "",
        Eliminado: 0,
        EsAnulado: 0,
        EstadoSorteo: 1,
        FechaCreacion: "2020-09-05T19:28:35",
        FechaHoraSorteo: "2020-10-02T23:00:00",
        FechaInicio: "2020-09-03T02:04:33",
        FechaTermino: "2020-10-02T23:00:00",
        HoraSorteo: null,
        Icono: "",
        Id: 1,
        InicioCartones: 500,
        Numero: 1,
        ReuIdCreador: 1,
        Subtitulo: "SUBTITULO SORTEO 1",
        TerminoCartones: 2000,
        TieneCartones: 1,
        Titulo: "SORTEO 1",
        TotalVendido: 0,
        UrlEvento: "",
        UrlSlide: "http://bingonario-001-site1.ctempurl.com/apps/slides/1_banner.png",
        ValorSorteo: 2000,
        index: 1
    };
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
  urlToken;
  miWindow;

  constructor(
    private fb: FormBuilder,
    private auth: ServicioLoginService,
    private global: GajicoService,
    private router: Router,
    private toastr: ToastrManager,
    private _vcr: ViewContainerRef,
    private flow: FlowService,
    private dbService: NgxIndexedDBService,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute
  ) {
    //this.toastr.setRootViewContainerRef(_vcr);


   }
   closeMiWindow(){
      this.miWindow.close();
  }
  ngDoCheck(): void {
    console.log("do check prueba compra");
  }

  pagar(template: TemplateRef<any>) {
    this.loading = true;
    //buenooooooo

    /*     this.flow.getPayments("2020-09-08").subscribe((res: any)=>{
          console.log(res);
          this.loading = false;
        },
        error => {
          this.loading = false;
          console.log(error);
        }
        ) */

/*     this.flow.createOrder('pagopruebacliente', 5000, 'vcoronado.alarcon@gmail.com', 1834560233).then((res: any) => {
      console.log(res);
      if (res.data && res.data.token) {
        //guardamos la orden en una variable de sesión por mientras
        sessionStorage.setItem('ORDEN_PAGO', res.data.flowOrder.toString());
        sessionStorage.setItem('TOKEN_ORDEN_PAGO', res.data.token);
        var url = res.data.url + '?token=' + res.data.token;

        this.urlToken = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        //abrimos modal
        //this.modalRef = this.modalService.show(template);

      }
    },
      error => {
        console.log(error);
      }
    ) */
    //ESTO ESTOY VIENDO, PERO INDEPENDIENTE QUE SE CANCELE O SE HAGA CORRECTO SIEMPRE MANDA EL MISMO
    //QUERY STRING OPERACION=CANCELAR QUIZAS HAYA QUE HACER UNA PAGINA APARTE PARA CADA COSA
    //ng serve --ssl true --host "www.bingonariocoro.cl"

      //tomamos las variables para construir la orden
      var fechaActual = moment().format('YYYYMMDDHHmm');
      var entidadGuardar = {
        nombreCompleto: this.formaComprador.controls.nuevoNombreCompleto.value,
        email: this.formaComprador.controls.nuevoEmail.value,
        sotId: this.formaSorteo.controls.nuevoNroSorteo.value,
        cantidad: this.formaSorteo.controls.nuevoCantidad.value,
        usuId: this.usuario.Id,
        subtotal: this.formaSorteo.controls.nuevoSubtotal.value,
        producto: this.formaSorteo.controls.nuevoSubtotal.value,
        ordenInterna: this.usuario.Id.toString() +'-'+this.formaSorteo.controls.nuevoNroSorteo.value.toString() +'-'+ fechaActual,
        subject: 'Compra ' + this.formaSorteo.controls.nuevoSubtotal.value,
        token: null,
        flowOrder: null

      };

      
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
        window.location.href = url;

      }
    },
      error => {
        console.log(error);
      }
    )
  }
  usarMisDatos() {
    if (this.usuario) {
      this.formaComprador.controls.nuevoNombreCompleto.setValue(this.usuario.NombreCompleto);
      this.formaComprador.controls.nuevoTelefono.setValue(this.usuario.Telefono);
      this.formaComprador.controls.nuevoEmail.setValue(this.usuario.Email);
      this.formaComprador.controls.nuevoRepitaEmail.setValue(this.usuario.Email);
    }
  }
  ngOnInit() {

    if (sessionStorage.getItem('USER_LOGUED_IN')) {
      this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));

    }
    if (sessionStorage.getItem('USER_ROL')) {
      this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
      if (this.rol.Id == 1) {
        this.esAdmin = true;
      }
    }
    //ACA QUEDE, ESTO ESTA FUNCIONANDO HAY QUE GENERAR PROCESOS PARA ANULAR
    //GENERAR PROCESOS PARA PERSISTIR DATOS DE LA COMPRA
    //IMPLEMENTAR CORRECTAMENTE EN EL FRONT
    //APLICAR ESTILOS EN EL BACK PARA QUE SE PAREZCA A BINGONARIO
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log(params);
      if (params['operacion']){
        //si tiene parametro entonces se debe obtener la variables de sesión para
        //consultar el status
        if (sessionStorage.getItem('ORDEN_FLOW')){
          var ordenFlow = JSON.parse(sessionStorage.getItem('ORDEN_FLOW'));
          if (ordenFlow.token){
            //ahora realizamos la llamada para verificar el estado
            this.loading = true;
            this.flow.getStatusOrder(ordenFlow.token).subscribe((res:any)=>{
              this.loading = false;
              if (res){
                //existe el elemento, por lo tanto se evalua la respuesta
                switch (res.status){
                  case 1://pendiente de pago
                    console.log('pendiente de pago, rollback de la compra');
                    console.log(ordenFlow);
                    this.showToast('warning', 'La operación se ha cancelado', 'Orden', 4000);
                    break;
                  case 2: //pagada
                    console.log('Correcto pago, hay que actualizar la compra como pagada. y luego enviarlo a la página de tickets');
                    console.log(ordenFlow);
                    this.showToast('success', 'La operación se ha realizado con éxito', 'Orden', 4000);
                    break;
                  case 3: //rechazada
                    console.log('rechazada, rollback de la compra');
                    console.log(ordenFlow);
                    this.showToast('error', 'La operación ha sido rechazada', 'Orden', 4000);
                    break;
                  case 4: //anulada
                    console.log('anulada, rollback de la compra');
                    console.log(ordenFlow);
                    this.showToast('error', 'La operación ha sido anulada', 'Orden', 4000);
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
      //aca si hay parametros entonces procedemos a verificar la orden de pago
      //con el token

    });

    console.log(this.sorteoComprando);
    this.cargarForma();
    this.cargarFormaComprador();
  }
  // convenience getter for easy access to form fields
  get f() { return this.formaComprador.controls; }

  onSubmit(){
    this.submitted = true;
    console.log(this.formaComprador);
    console.log(this.formaSorteo);
    if (this.formaSorteo.invalid || this.formaComprador.invalid){
      return;
    }
    //aca seguimos con el proceso de compra
    var correcto = false;
    var sotId = this.formaSorteo.controls.nuevoNroSorteo.value;
    var cantidad = this.formaSorteo.controls.nuevoCantidad.value;
    var usuId = this.usuario.Id;
    var nombreCompleto = this.formaComprador.controls.nuevoNombreCompleto.value;
    var email = this.formaComprador.controls.nuevoEmail.value;
    var telefono = this.formaComprador.controls.nuevoTelefono.value;
    var esCortesia = 0;
    //window.open(this.urlSorteo, '_self');
    //localStorage.setItem('PRUEBA', nombreCompleto);
    //lo comentamos por mientras
    /*
    this.loading = true;
    this.global.postComprarSorteo(sotId, cantidad, usuId, nombreCompleto, email, telefono, esCortesia).subscribe(
      (rs: any)=> {
        this.loading = false;
        var datos: any = rs;
        //aca debemos validar el mensaje
        if (datos && datos.length > 0){
          correcto = true;
        }
        else{
          //incorrecto
          this.showToast('error', 'Error al comprar', 'Compra', 3000);
          console.log('incorrecto');
        }
      },
      er => {
        this.loading = false;
        //console.log('incorrecto' + er);
        this.showToast('error',er,'Error', 5000); 
      },
      () => {
        if (correcto){
          console.log('Seguir con el proceso de compra');
          //aca deberiamos seguir con el proceso de compra
          //por mientras lo derivamos a inicio de usuario
          this.showToast('success', 'Compra realizada con éxito', 'Compra', 5000);
          if (this.esAdmin){
            this.router.navigateByUrl('/sorteos')
            .then(data => console.log(data),
              error =>{
                console.log(error);
              }
            )
          }
          else{
            this.router.navigateByUrl('/iniciocliente')
            .then(data => console.log(data),
              error =>{
                console.log(error);
              }
            )
          }
        }
        else{
          console.log('error de servidor al comprar');
        }
        
      }
    );

    */

  }
  cancelar(){
    this.router.navigateByUrl('/home')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
  }

  cargarForma() {
    var nroSorteo = this.sorteoComprando == null ? 0 : this.sorteoComprando.Numero;
    //dejamos el titulo como producto
    var producto = this.sorteoComprando == null ? '' : this.sorteoComprando.Titulo;
    var precio = this.sorteoComprando == null ? 0 : this.sorteoComprando.ValorSorteo;
    this.fotoSorteo = this.sorteoComprando == null ? '#' : this.sorteoComprando.UrlSlide;
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

  }
  cargarFormaComprador() {

    this.formaComprador = new FormGroup({
        'nuevoNombreCompleto': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]),
        'nuevoEmail': new FormControl('', [Validators.required, Validators.pattern(this.expEmail)]),
        'nuevoRepitaEmail': new FormControl('', [Validators.required]),
        'nuevoTelefono': new FormControl('', [Validators.required, Validators.pattern(this.expCelular)]),
    }, { validators: this.EmailIgualesValidator });

    //console.log(this.forma.valid + ' ' + this.forma.status);
}
  onChangeCantidad(event){
    console.log(event);
    if (event.target.value){
      //calculamos subtotal
      var cantidad = parseInt(event.target.value);
      var precio = this.formaSorteo.controls.nuevoPrecio == null ? 0 : this.formaSorteo.controls.nuevoPrecio.value;
      var subtotal = cantidad * precio;
      this.formaSorteo.controls.nuevoSubtotal.setValue(subtotal);
    }
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
  dismiss(toast){
    this.toastr.dismissToastr(toast);
  }
  EmailIgualesValidator: ValidatorFn = (fg: FormGroup) => {
    const email = fg.get('nuevoEmail').value;
    const emailR = fg.get('nuevoRepitaEmail').value;
    if (email !== null && emailR !== null && email != emailR){
      this.formaComprador.controls.nuevoRepitaEmail.setErrors({emailIguales: false});
    }
    return email !== null && emailR !== null && email != emailR ? null : null ;
  };
}