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
  selector: 'app-cambiar-clave',
  templateUrl: './cambiar-clave.component.html',
  styleUrls: ['./cambiar-clave.component.css']
})
export class CambiarClaveComponent implements OnInit {
    usuario;
    rol;

  forma: FormGroup;
  loading = false;
  submitted = false;
  resolvedCaptcha = false;
  expCelular = /^(\+?56)?(\s?)(0?9)(\s?)[9876543]\d{7}$/gm;
  expPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/gm;
  expEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/gm;

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
        this.cargarForma();
        if (sessionStorage.getItem('USER_LOGUED_IN')) {
            this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
            
        }
        if (sessionStorage.getItem('USER_ROL')) {
            this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
        }
    }
  // convenience getter for easy access to form fields
  get f() { return this.forma.controls; }


  onSubmit(){
    this.submitted = true;
    if (this.forma.invalid){
      return;
    }
    var password = this.forma.controls.nuevoClaveActual.value;
    var nuevaClave = this.forma.controls.nuevoClave.value;
    var reuId = this.usuario.Id;
    //estamos todo bien
    this.loading = true;
    this.global.postCambiarClave(nuevaClave, reuId, password).subscribe(
      (rs: any)=> {
        this.loading = false;
        var datos: any = rs;
        //aca debemos validar el mensaje
        if (datos.Mensaje && datos.Mensaje.TipoMensaje == 1){
          //todo bien
          sessionStorage.setItem("USER_LOGUED_IN", JSON.stringify(datos.Registro));
          sessionStorage.setItem("USER_ROL", JSON.stringify(datos.Rol));
          this.showToast('info', 'Tu clave se ha cambiada con éxito', 'Clave', 3000);
          this.forma.reset();
        }
        else{
          //incorrecto
          this.showToast('error', datos.Mensaje.TextoMensaje, 'Clave', 3000);
          console.log('incorrecto');
        }

      },
      er => {
        this.loading = false;
        //console.log('incorrecto' + er);
        this.showToast('error',er,'Error', 5000); 
      },
      () => {
        console.log('correcto llevar a la página de inicio del usuario normal');
      }
    );

    //alert('Correcto');
  }

  cargarForma() {

    this.forma = new FormGroup({
      'nuevoClaveActual': new FormControl('', [Validators.required]),
      'nuevoClave': new FormControl('', [Validators.required, Validators.pattern(this.expPassword)]),
      'nuevoRepitaClave': new FormControl('', [Validators.required, Validators.pattern(this.expPassword)]),
    }, { validators: this.PassIgualesValidator });

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

PassIgualesValidator: ValidatorFn = (fg: FormGroup) => {
    const pass = fg.get('nuevoClave').value;
    const passR = fg.get('nuevoRepitaClave').value;
    if (pass !== null && passR !== null && pass != passR){
      this.forma.controls.nuevoRepitaClave.setErrors({passIguales: false});
    }
    return pass !== null && passR !== null && pass != passR ? null : null ;
  }; 
}