import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrManager } from 'ng6-toastr-notifications';

//Servicios
import { ServicioLoginService } from '../servicios/servicio-login-service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loading = false;
  loginUsuario:string;
  loginContrasena:string;
  isLogged: boolean = false;
  isAdmin: boolean = false; 
  rol;
  ambiente = '';
  configuraciones: any;

  constructor(
    private auth: ServicioLoginService,
    private router: Router,
    private toastr: ToastrManager,
    private _vcr: ViewContainerRef
  ) {
    //this.toastr.setRootViewContainerRef(_vcr);

   }

  ngOnInit() {
    if (localStorage.getItem('CONFIGURACION')) {
      this.configuraciones = JSON.parse(localStorage.getItem('CONFIGURACION'));
      console.log(this.configuraciones);
    }
  }
  abrirRecuperarClave(){
    this.router.navigateByUrl('/recuperarclave')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
  }

  IniciarSesionDos(){
    //HAY QUE VERIFICAR SI ESTÁ COMPRANDO UN SORTEO PARA DERIVARLO A LA PAGINA DE COMPRAS
    if (!this.loginUsuario ){
      //return console.log('Nombre de usuario requerido');
      return this.showToast('error','Nombre de usuario requerido','Error');
    }
    if(!this.loginContrasena){
      //return console.log('clave vacia'); 
      return this.showToast('error','Contraseña requerida','Error');
    }
    this.loading = true;
    this.auth.loginData(this.loginUsuario,this.loginContrasena).subscribe(
      (rs: any)=> {
        this.loading = false;
        var datos: any = rs;
        //aca debemos validar el mensaje
        if (datos.Mensaje && datos.Mensaje.TipoMensaje == 1){
          sessionStorage.setItem("USER_LOGUED_IN", JSON.stringify(datos.Registro));
          sessionStorage.setItem("USER_ROL", JSON.stringify(datos.Rol));
          this.isLogged = true;
          if (datos.Rol.Id == 1){
            this.isAdmin = true;
          }
        }
        else{
          this.showToast('error', datos.Mensaje.TextoMensaje, 'Login');
          this.isLogged = false;
        }

      },
      er => {
        this.loading = false;
        //console.log('incorrecto' + er);
        this.showToast('error',er,'Error'); 
      },
      () => {
        if(this.isLogged){
          var estaComprando = false;
          if (sessionStorage.getItem('SORTEO_COMPRANDO')) {
            estaComprando = true;
          }
          if (estaComprando){
            if (environment.USA_PAYU == true){
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
            console.log('esta comprando');

          }
          else{
            if (this.isAdmin) {
              //correcto
              console.log('Correcto administrador web');
              this.router.navigateByUrl('/sorteos')
                .then(data => console.log(data),
                  error => {
                    console.log(error);
                  }
                )
            }
            else {
              //correcto
              console.log('Correcto usuario mormal');
              this.router.navigateByUrl('/iniciocliente')
                .then(data => console.log(data),
                  error => {
                    console.log(error);
                  }
                )
            }
          }
        }
        else{
          //incorrecto
          console.log('Incorrecto');
          this.showToast('error','Usuario o contraseña incorrecto','Error');
        }
      }
    );
  }
  IniciarSesion(){

    if (!this.loginUsuario ){
      //return console.log('Nombre de usuario requerido');
      return this.showToast('error','Nombre de usuario requerido','Error');
    }
    if(!this.loginContrasena){
      //return console.log('clave vacia'); 
      return this.showToast('error','Contraseña requerida','Error');
    }
    this.loading = true;

   let retorno = this.auth.login(this.loginUsuario,this.loginContrasena);
   this.loading = false;
   console.log(retorno);
     
  }
  
  showToast(tipo, mensaje, titulo){
    if (tipo == 'success'){
      this.toastr.successToastr(mensaje, titulo);
    }
    if (tipo == 'error'){
      this.toastr.errorToastr(mensaje, titulo);
    }
    if (tipo == 'info'){
      this.toastr.infoToastr(mensaje, titulo);
    }
    if (tipo == 'warning'){
      this.toastr.warningToastr(mensaje, titulo);
    }

  }
}
