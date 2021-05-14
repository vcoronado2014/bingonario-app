import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-header-app',
  templateUrl: './header-app.component.html',
  styleUrls: ['./header-app.component.css']
})
export class HeaderAppComponent implements OnInit {
  usuario;
  rol;
  logueado = false;
  titulo: string = '';
  subtitulo: string = '';
  ambiente = '';
  isStatic = environment.HOME_ESTATICO;
  constructor(
    private router: Router
  ) {

   }

  ngOnInit() {
    if (sessionStorage.getItem('USER_LOGUED_IN')){
      this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
    }
    if (sessionStorage.getItem('USER_ROL')){
      this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
      this.logueado = true;
    }

  }
  salir(){
    sessionStorage.clear();
    
    this.logueado = false;
    this.router.navigateByUrl('/home')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
  }
  abrirCartones(){
    this.router.navigate(['cartones'], {
       queryParams: {
         Id: '0'
       }
     })
   }

}
