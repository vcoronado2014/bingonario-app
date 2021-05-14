import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder, ValidatorFn, EmailValidator } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrManager } from 'ng6-toastr-notifications';

//Servicios
import { ServicioLoginService } from '../servicios/servicio-login-service';
import { GajicoService } from '../servicios/gajico.service';
import { environment } from '../../environments/environment';
//crypto js
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-respuesta-compra',
  templateUrl: './respuesta-compra.component.html',
  styleUrls: ['./respuesta-compra.component.css']
})
export class RespuestaCompraComponent implements OnInit {
    usuario;
    rol;

  constructor(
    private fb: FormBuilder,
    private auth: ServicioLoginService,
    private global: GajicoService,
    private router: Router,
    private toastr: ToastrManager,
    private _vcr: ViewContainerRef,
    private activatedRoute: ActivatedRoute,
  ) {
    //this.toastr.setRootViewContainerRef(_vcr);
    this.activatedRoute.queryParams.subscribe((params) => {
        var param = params['token'];
        console.log(param);
    })
    console.log(this.activatedRoute.params);

   }

    ngOnInit() {
        if (sessionStorage.getItem('USER_LOGUED_IN')) {
            this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
            
        }
        if (sessionStorage.getItem('USER_ROL')) {
            this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
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

}