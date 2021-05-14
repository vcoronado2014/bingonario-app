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
  selector: 'app-error-compra',
  templateUrl: './error-compra.component.html',
  styleUrls: ['./error-compra.component.css']
})
export class ErrorCompraComponent implements OnInit {
    usuario;
    rol;
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
        console.log(params);
    })

   }

    ngOnInit() {
        
        if (sessionStorage.getItem('USER_LOGUED_IN')) {
            this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
            
        }
        if (sessionStorage.getItem('USER_ROL')) {
            this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
            if (this.rol.Id == 1){
              this.esAdmin = true;
            }
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


}