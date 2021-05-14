import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder, ValidatorFn, EmailValidator } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrManager } from 'ng6-toastr-notifications';

//Servicios
import { ServicioLoginService } from '../servicios/servicio-login-service';
import { GajicoService } from '../servicios/gajico.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pre-compra',
  templateUrl: './pre-compra.component.html',
  styleUrls: ['./pre-compra.component.css']
})
export class PreCompraComponent implements OnInit {

  forma: FormGroup;
  loading = false;
  submitted = false;
  resolvedCaptcha = false;
  expCelular = /^(\+?56)?(\s?)(0?9)(\s?)[9876543]\d{7}$/gm;
  expPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/gm;
  expEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/gm;
  keyRecaptcha = environment.SITE_KEY_RECAPTCHA;

  configuraciones: any;
  usuario;
  rol;
  sorteoComprando;
  esAdmin;
  seleccionado: any = 'Chile';
  constructor(
    private fb: FormBuilder,
    private auth: ServicioLoginService,
    private global: GajicoService,
    private router: Router,
    private toastr: ToastrManager,
    private _vcr: ViewContainerRef
  ) {
    //this.toastr.setRootViewContainerRef(_vcr);


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
      if (sessionStorage.getItem('SORTEO_COMPRANDO')) {
        this.sorteoComprando = JSON.parse(sessionStorage.getItem('SORTEO_COMPRANDO'));
      }
      sessionStorage.setItem('PAIS_COMPRANDO', this.seleccionado);
    //this.cargarForma();
  }
  // convenience getter for easy access to form fields
  get f() { return this.forma.controls; }

  verificaCorreo(event){
    var correo = null;
    if (this.forma.controls.nuevoEmail && this.forma.controls.nuevoEmail.invalid == false && this.forma.controls.nuevoEmail.value){
      correo = this.forma.controls.nuevoEmail.value;
      this.loading = true;
      this.global.postRegistro(correo).subscribe(
        (rs: any)=> {
          this.loading = false;
          var datos: any = rs;
          //aca debemos validar el mensaje
          if (datos.Mensaje && datos.Mensaje.TipoMensaje == 1){
            //correo existe dejarlo pasar o no hacer nada
          }
          else{
            //no existe
            this.showToast('warning', 'Este correo no existe', 'Registro', 5000);
            //limpiar correo
            this.forma.controls.nuevoEmail.setValue('');
          }
  
        },
        er => {
          this.loading = false;
          //console.log('incorrecto' + er);
          this.showToast('error',er,'Error', 4000); 
        },
        () => {
          console.log('correcto');
        }
      );


    }
    
  }

  onSubmit(){
    this.submitted = true;
    if (this.forma.invalid){
      return;
    }
    var correo = this.forma.controls.nuevoEmail.value;
    //estamos todo bien
    this.loading = true;
    this.global.postRecuperarClave(correo).subscribe(
      (rs: any)=> {
        this.loading = false;
        var datos: any = rs;
        //aca debemos validar el mensaje
        if (datos.Mensaje && datos.Mensaje.TipoMensaje == 1){
          //todo bien
          var textoMensaje = "Su clave ha sido enviada a tu correo electrónico, revisa también el correo electrónico no deseado";
          this.showToast('info', textoMensaje, 'Recuperar clave', 3000);
          //limpiar form
          this.forma.reset();

        }
        else{
          //incorrecto
          this.showToast('error', datos.Mensaje.TextoMensaje, 'Recuperar clave', 3000);
          console.log('incorrecto');
        }

      },
      er => {
        this.loading = false;
        console.log('incorrecto' + er);
        this.showToast('error','Correo inválido o no existe','Error', 5000); 
      },
      () => {
        console.log('se hizo llamada para recuperar clave');
      }
    );

    //alert('Correcto');
  }

  cargarForma() {

    this.forma = new FormGroup({
        'nuevoEmail': new FormControl('', [Validators.required, Validators.pattern(this.expEmail)]),
    });

    console.log(this.forma.valid + ' ' + this.forma.status);
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
  onClickSeleccione(event){
      if (event){
          this.seleccionado = event;
          sessionStorage.setItem('PAIS_COMPRANDO', this.seleccionado);
      }
      console.log(this.seleccionado);
  }

  comprarSorteo() {
    console.log(this.sorteoComprando);
    if (this.usuario && this.usuario.Id > 0) {
      //esta logueado lo mandamos directo a la pagina
      //va a depender si es payu o no, aca lo vamos a ver
      this.irCompra();
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
    this.router.navigateByUrl('/comprasorteo')
      .then(data => console.log(data),
        error => {
          console.log(error);
        }
      )
  }

}