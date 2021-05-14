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
  selector: 'app-editar-registro',
  templateUrl: './editar-registro.component.html',
  styleUrls: ['./editar-registro.component.css']
})
export class EditarRegistroComponent implements OnInit {
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
        this.setearForma();
    }
  // convenience getter for easy access to form fields
  get f() { return this.forma.controls; }

    setearForma() {
        if (this.usuario && this.usuario.Id > 0){
            this.forma.controls.nuevoNombreCompleto.setValue(this.usuario.NombreCompleto);
            this.forma.controls.nuevoEmail.setValue(this.usuario.Email);
            this.forma.controls.nuevoTelefono.setValue(this.usuario.Telefono);

        }
    }

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
            //aca estamos mal ya que existe
            this.showToast('warning', 'Este correo ya existe use otro', 'Registro', 5000);
            //limpiar correo
            this.forma.controls.nuevoEmail.setValue('');
          }
          else{
            //correcto
            console.log('correcto');
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
    //estamos todo bien
    var registro = {
      Id: this.usuario.Id,
      NombreCompleto: this.forma.controls.nuevoNombreCompleto.value,
      NombreUsuario: this.usuario.NombreUsuario,
      Email: this.forma.controls.nuevoEmail.value,
      Telefono: this.forma.controls.nuevoTelefono.value,
      Password: this.usuario.Password,
      Activo: 1,
      Eliminado: 0,
      RolId: 2//usuario normal
    };
    this.loading = true;
    this.global.putRegistro(registro).subscribe(
      (rs: any)=> {
        this.loading = false;
        var datos: any = rs;
        //aca debemos validar el mensaje
        if (datos.Mensaje && datos.Mensaje.TipoMensaje == 1){
          //todo bien
          sessionStorage.setItem("USER_LOGUED_IN", JSON.stringify(datos.Registro));
          sessionStorage.setItem("USER_ROL", JSON.stringify(datos.Rol));
                  //lo dejamos ahi no más y obtenemos al usuario
        this.cargarForma();
        this.setearForma();
          this.showToast('info', 'Registro guardado con éxito', 'Registro', 3000);
          //limpiar form

        }
        else{
          //incorrecto
          this.showToast('error', datos.Mensaje.TextoMensaje, 'Registro', 3000);
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
        'nuevoNombreCompleto': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]),
        /* 'nuevoApellidos': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]), */
        'nuevoEmail': new FormControl('', [Validators.required, Validators.pattern(this.expEmail)]),
        'nuevoTelefono': new FormControl('', [Validators.required, Validators.pattern(this.expCelular)]),
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

/*   PassIgualesValidator: ValidatorFn = (fg: FormGroup) => {
    const pass = fg.get('nuevoClave').value;
    const passR = fg.get('nuevoRepitaClave').value;
    if (pass !== null && passR !== null && pass != passR){
      this.forma.controls.nuevoRepitaClave.setErrors({passIguales: false});
    }
    return pass !== null && passR !== null && pass != passR ? null : null ;
  }; */
}