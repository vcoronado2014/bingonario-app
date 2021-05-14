import { Component, OnInit, HostListener, DoCheck } from '@angular/core';
import { Router } from "@angular/router";
//servicios
import { UtilesService } from '../servicios/utiles.service';
//components
import { EditarRegistroComponent } from '../editar-registro/editar-registro.component'
import { EticketsComponent } from '../etickets/etickets.component'

@Component({
  selector: 'app-inicio-cliente',
  templateUrl: './inicio-cliente.component.html',
  styleUrls: ['./inicio-cliente.component.css']
})
export class InicioClienteComponent implements OnInit, DoCheck {
  usuario;
  rol;
  isMobile = false;

  modulo = 'etickets';
  eticketsSeleccionado = true;
  datosPersonalesSeleccionado = false;
  cambiarClaveSeleccionado = false;

  


  constructor(
    private router: Router,
    public utiles: UtilesService,
  ) { 
    this.isMobile = this.utiles.EsMobil();
  }
  ngDoCheck(): void {
    console.log("do check inicio");
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

  ngOnInit() {
    if (sessionStorage.getItem('USER_LOGUED_IN')){
      this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
    }
    if (sessionStorage.getItem('USER_ROL')){
      this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
    }
  }
  seleccionaModulo(opcion){
    this.modulo = opcion;
    if (this.modulo == 'etickets'){
      this.eticketsSeleccionado = true;
      this.datosPersonalesSeleccionado = false;
      this.cambiarClaveSeleccionado = false;
    }
    if (this.modulo == 'editarregistro'){
      this.eticketsSeleccionado = false;
      this.datosPersonalesSeleccionado = true;
      this.cambiarClaveSeleccionado = false;
    }
    if (this.modulo == 'cambiarclave'){
      this.eticketsSeleccionado = false;
      this.datosPersonalesSeleccionado = false;
      this.cambiarClaveSeleccionado = true;
    }
    console.log('ticket' + this.eticketsSeleccionado);
    console.log('datospersonales' + this.datosPersonalesSeleccionado);
    console.log('cambiar clave' + this.cambiarClaveSeleccionado);
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = this.utiles.EsMobil();
  }

}
