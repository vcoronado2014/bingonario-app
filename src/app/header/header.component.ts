import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
  })

  export class HeaderComponent implements OnInit {
    usuario = {NombreCompleto: ''};
    rol;
    logueado = false;
    admin = false;
    normal = false;
    isStatic = environment.HOME_ESTATICO;
    constructor(
        private router: Router
      ) {
    
       }

       //init
       ngOnInit() {
        if (sessionStorage.getItem('USER_LOGUED_IN')){
          this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
          this.logueado = true;
        }
        if (sessionStorage.getItem('USER_ROL')){
          this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
          if (this.rol.Id != 2){
            this.admin = true;
          }
          else {
            this.normal = true;
          }
        }
        console.log('logueado' + this.logueado);
        console.log('admin' + this.admin);
        console.log('normal' + this.normal);
       }
       abrirCartones(){
        this.router.navigate(['cartones'], {
           queryParams: {
             Id: '0'
           }
         })
       }
       abrirRegistro(){
        this.router.navigateByUrl('/registro')
        .then(data => console.log(data),
          error =>{
            console.log(error);
          }
        )
       }
       salir(){
        sessionStorage.clear();
        this.logueado = false;
        this.admin = false;
        this.router.navigateByUrl('/')
        .then(data => console.log(data),
          error =>{
            console.log(error);
          }
        )
      }
  }