import { Component, OnInit, DoCheck } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-header-cliente',
  templateUrl: './header-cliente.component.html',
  styleUrls: ['./header-cliente.component.css']
})
export class HeaderClienteComponent implements OnInit, DoCheck {
  usuario;
  rol;
  logueado = false;
  titulo: string = '';
  subtitulo: string = '';
  ambiente = '';
  constructor(
    private router: Router
  ) {

   }
  ngDoCheck(): void {
    if (sessionStorage.getItem('USER_LOGUED_IN')){
      this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
    }
    if (sessionStorage.getItem('USER_ROL')){
      this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
    }
  }

  ngOnInit() {
    if (sessionStorage.getItem('USER_LOGUED_IN')){
      this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
    }
    if (sessionStorage.getItem('USER_ROL')){
      this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
    }

  }
  salir(){
    sessionStorage.clear();
    this.router.navigateByUrl('/home')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
  }

}
