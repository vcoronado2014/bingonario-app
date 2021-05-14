import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder, ValidatorFn, EmailValidator } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrManager } from 'ng6-toastr-notifications';
//datepicker
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';

//Servicios
import { ServicioLoginService } from '../servicios/servicio-login-service';
import { GajicoService } from '../servicios/gajico.service';
import { environment } from '../../environments/environment';
//archivos
import { AngularFileUploaderComponent } from "angular-file-uploader";

import * as moment from 'moment';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
declare var $: any;


@Component({
  selector: 'app-editar-sorteo',
  templateUrl: './editar-sorteo.component.html',
  styleUrls: ['./editar-sorteo.component.css']
})
export class EditarSorteoComponent implements OnInit {
  usuario;
  rol;
  titulo= '';
  esNuevo = false;
  idEditar = 0;
  sorteoEditando = null;
  urlIcono = '';
  urlBanner = '';
  ultimoNumero = 0;
  //date picker
  //bsRangeValue: Date[];
  //variable para determinar fecha minima de sorteo
  minSorteoDate: Date;
  minInicioDate: Date;
  maxSorteoDate: Date;
  maxInicioDate: Date;

  forma: FormGroup;
  loading = false;
  submitted = false;
  resolvedCaptcha = false;
  expCelular = /^(\+?56)?(\s?)(0?9)(\s?)[9876543]\d{7}$/gm;
  expPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/gm;
  expEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/gm;
  fechaSorteo;
  maxDateSorteo;
  //configuracion de archivos
  afuConfig = {
    uploadAPI: {
      url:"https://example-file-upload-api"
    },
    multiple: false,
    formatsAllowed: ".jpg,.png",
    maxSize: "3",
    hideProgressBar: false,
    hideResetBtn: true,
    hideSelectBtn: false,
    fileNameIndex: true,
    replaceTexts: {
      selectFileBtn: 'Seleccione',
      resetBtn: 'Borrar',
      uploadBtn: 'Subir',
      dragNDropBox: 'Arastre aquí',
      attachPinBtn: 'Adjunte archivos...',
      afterUploadMsg_success: 'Cargado con exito !',
      afterUploadMsg_error: 'Error en la carga !',
      sizeLimit: 'Tamaño máximo'
    }
};
    @ViewChild('fileUpload1', {static: true})
    private fileUpload1:  AngularFileUploaderComponent;
    @ViewChild('fileUpload2', {static: true})
    private fileUpload2:  AngularFileUploaderComponent;

  constructor(
    private fb: FormBuilder,
    private auth: ServicioLoginService,
    private global: GajicoService,
    private router: Router,
    private toastr: ToastrManager,
    private _vcr: ViewContainerRef,
    private activatedRoute: ActivatedRoute,
    public localeService: BsLocaleService,
  ) {

   }

   DocUpload(event){
     console.log(event);
   }
  ngOnInit() {
    defineLocale('es', esLocale);
    this.localeService.use('es');
    moment.locale('es');
    //seteamos la fecha minima sorteo
    this.minSorteoDate = new Date();
    //sumamos 3 días
    this.minSorteoDate.setDate(this.minSorteoDate.getDate() + 3);

    //seteamos la fecha minima inicio
    this.minInicioDate = new Date();
    //sumamos 3 días
    this.minInicioDate.setDate(this.minInicioDate.getDate() - 3);

    //seteamos la fecha maxima sorteo
    this.maxSorteoDate = new Date();
    //sumamos 3 días
    this.maxSorteoDate.setDate(this.maxSorteoDate.getDate() + 120);
    //seteamos la fecha maxima sorteo
    this.maxInicioDate = new Date();
    //sumamos 3 días
    this.maxInicioDate.setDate(this.maxInicioDate.getDate() + 120);


    if (sessionStorage.getItem('USER_LOGUED_IN')){
      this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
    }
    if (sessionStorage.getItem('USER_ROL')){
      this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
    }
    this.cargarForma();
    this.activatedRoute.queryParams.subscribe((params) => {
        this.idEditar = parseInt(params['Id']);
        this.esNuevo = (params['EsNuevo'] === 'true');
        console.log(params['Id']);
        console.log(params['EsNuevo']);
        if (this.esNuevo){
          this.forma.reset({});
          this.titulo= 'Estás creando un nuevo Sorteo';
          this.obtenerUltimoNumero();
        }
        else {
          //buscar el sorteo que esta editando
          this.obtenerSorteoId(this.idEditar);
        }
    });
  }
  // convenience getter for easy access to form fields
  get f() { return this.forma.controls; }

  setForma(data) {
    this.forma.controls.nuevoNumero.setValue(data.Numero);
    this.forma.controls.nuevoCodigo.setValue(data.Codigo);
    var fechaSorteo = moment(data.FechaHoraSorteo).toDate();
    var horaSorteo = moment(data.FechaHoraSorteo).format('HH:mm');
    this.forma.controls.nuevoHoraSorteo.setValue(horaSorteo);
    this.forma.controls.nuevoFechaSorteo.setValue(fechaSorteo);
    var fechaInicio = moment(data.FechaInicio).toDate();
    this.forma.controls.nuevoFechaInicio.setValue(fechaInicio);
    /* var fechaTermino = moment(data.FechaTermino).toDate(); */
/*     this.forma.controls.nuevoFechaTermino.setValue(fechaTermino); */
    this.forma.controls.nuevoTitulo.setValue(data.Titulo);
    this.forma.controls.nuevoSubTitulo.setValue(data.Subtitulo);
    //falta cargan las imagenes
    if (data.Banner && data.Banner != '' && data.Banner != '#' && data.Banner.length > 5) {
      this.urlBanner = environment.URL_SLIDE + data.Banner;
    }
    if (data.Icono && data.Icono != '' && data.Icono != '#' && data.Icono.length > 5) {
      this.urlIcono = environment.URL_SLIDE + data.Icono;
    }
    this.forma.controls.nuevoNumeroInicio.setValue(data.InicioCartones);
    this.forma.controls.nuevoNumeroTermino.setValue(data.TerminoCartones);
    this.forma.controls.numeroValorSorteo.setValue(data.ValorSorteo);
    this.forma.controls.nuevoUrlEvento.setValue(data.UrlEvento);


    //desactivamos un par de campos
    if (data.InicioCartones > 0){
      this.forma.controls.nuevoNumeroInicio.disable();
    }
    this.forma.controls.nuevoNumero.disable();
    if (data.TerminoCartones >0){
      this.forma.controls.nuevoNumeroTermino.disable();
    }
    if (data.ValorSorteo > 0){
      this.forma.controls.numeroValorSorteo.disable();
    }
    //seteamos el titulo
    this.titulo = 'Estas editando el sorteo Número ' + data.Numero + ' con código ' + data.Codigo;
  }

  keyDowEnterNumero(event) {
    //console.log(event);
    var numero = event.target.value;

    //ambos elementos deben existir para realizar la llamada
    if (numero && numero.length > 0) {
      //ahora realizamos la busqueda
      this.loading = true;
      this.global.getExisteNumero(numero).subscribe(data => {
        var existe = data;
        if (existe){
          this.showToast('warning', 'Este número de sorteo ya existe', 'Número sorteo', 5000);
          //limpiamos numero
          this.forma.controls.nuevoNumero.setValue(this.ultimoNumero);
        }
      },
      err => {
        console.log(err);
        this.loading = false;
      },
      ()=>{
        //correcto
        this.loading = false;
      }
      )
    }

  }

  obtenerSorteoId(id: any){
    this.loading = true;
    this.global.getSorteoId(id.toString()).subscribe(
      (datos : any) => {
        if (datos) {
          if (datos.Mensaje && datos.Mensaje.TipoMensaje == 1){
            this.sorteoEditando = datos.Sorteos[0];
            //setear forma
            this.setForma(this.sorteoEditando);
          }
          else {
            //error al obtener
            this.showToast('error', 'Error de servidor', 'Obtener', 3000);
          }
          console.log(this.sorteoEditando);
          this.loading = false;
        }
      }
    )
  }
  obtenerUltimoNumero(){
    this.loading = true;
    this.global.postUltimoId().subscribe(
      (datos : any) => {
        if (datos) {
          this.ultimoNumero = datos;
          console.log(this.ultimoNumero);
          //set ultimo numero
          this.forma.controls.nuevoNumero.setValue(this.ultimoNumero);
          this.loading = false;
        }
        else{
          this.loading = false;
          this.ultimoNumero = 1;
          this.forma.controls.nuevoNumero.setValue(this.ultimoNumero);
        }
      },
      error => {
        this.loading = false;
        this.ultimoNumero = 1;
        this.forma.controls.nuevoNumero.setValue(this.ultimoNumero);
      }
    )
  }
  crearEntidad(){
    //otras validaciones antes de crear para guardar
    var nombreBanner = '';
    var nombreIcono = '';
    var fileBanner;
    var fileIcono;
    var tieneBanner = false;
    var tieneIcono = false;
    var estadoSorteo = 1;//abierto

    if (this.esNuevo){
      if (this.fileUpload1.allowedFiles.length == 0){
        //si no tiene archivo banner no se puede guardar
        this.showToast('error', 'Debes adjuntar la imágen de banner', 'Banner', 3000);
        return;
      }
    }
    //tratamiento banner
    if (this.fileUpload1.allowedFiles.length == 0){
      if (!this.esNuevo){
        nombreBanner = this.sorteoEditando.Banner;
      }

    }
    else {
      nombreBanner = this.fileUpload1.allowedFiles[0].name;
      fileBanner = this.fileUpload1.allowedFiles[0];
      tieneBanner = true;
    }
    //tratamiento icono
    if (this.fileUpload2.allowedFiles.length == 0){
      if (!this.esNuevo){
        nombreIcono = this.sorteoEditando.Icono;
      }

    }
    else {
      nombreIcono = this.fileUpload2.allowedFiles[0].name;
      fileIcono = this.fileUpload2.allowedFiles[0];
      tieneIcono = true;
    }

    //por aca todo bien
    var entidad = {
      Id: this.idEditar,
      Numero: this.forma.controls.nuevoNumero == null ? 0 : this.forma.controls.nuevoNumero.value,
      Codigo: this.forma.controls.nuevoCodigo.value,
      FechaInicio: this.forma.controls.nuevoFechaInicio.value,
/*       FechaTermino: this.forma.controls.nuevoFechaTermino.value, */
      FechaHoraSorteo: this.forma.controls.nuevoFechaSorteo.value,
      ReuIdCreador: this.usuario.Id,
      Banner: nombreBanner,
      Icono: nombreIcono,
      Titulo: this.forma.controls.nuevoTitulo == null ? '' : this.forma.controls.nuevoTitulo.value,
      Subtitulo: this.forma.controls.nuevoSubTitulo == null ? '' : this.forma.controls.nuevoSubTitulo.value,
      Detalle: '',
      Activo: 1,
      Eliminado: 0,
      HoraSorteo: this.forma.controls.nuevoHoraSorteo.value,
      //estos elementos son para procesar cuando guarde
      TieneBanner: tieneBanner,
      ArchivoBanner: fileBanner,
      TieneIcono: tieneIcono,
      ArchivoIcono: fileIcono,
      //para controlar el numero de inicio y fin
      InicioCartones: this.forma.controls.nuevoNumeroInicio == null ? 0 : this.forma.controls.nuevoNumeroInicio.value,
      TerminoCartones: this.forma.controls.nuevoNumeroTermino == null ? 0 : this.forma.controls.nuevoNumeroTermino.value,
      ValorSorteo: this.forma.controls.numeroValorSorteo == null ? 0 : this.forma.controls.numeroValorSorteo.value,
      UrlEvento: this.forma.controls.nuevoUrlEvento.value == null ? '' : this.forma.controls.nuevoUrlEvento.value,
    };

    return entidad;
  }
  limpiar(){
    this.forma.reset({});
    this.forma.controls.nuevoNumero.enable();
    this.sorteoEditando = null;
    this.idEditar = 0;
    this.urlIcono = '';
    this.urlBanner = '';
  }

  onSubmit(){
    this.submitted = true;
    if (this.forma.invalid){
      return;
    }
    //me falta validar que la fecha del sorteo sea mayor a la fecha de inicio
    console.log(this.fileUpload1);
    console.log(this.fileUpload2);
    console.log(this.forma);
    var entidadGuardar = this.crearEntidad();
    console.log(entidadGuardar);
    this.loading = true;
    this.global.putSorteo(entidadGuardar).subscribe(
      (rs: any)=> {
        this.loading = false;
        var datos: any = rs;
        //aca debemos validar el mensaje
        if (datos.Mensaje && datos.Mensaje.TipoMensaje == 1){
          //todo bien
          this.sorteoEditando = datos.Sorteos[0];
          this.showToast('info', 'Registro guardado con éxito', 'Registro', 3000);
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
        //aca enviamos el archivo
       if (entidadGuardar.TieneBanner || entidadGuardar.TieneIcono){
         this.loading = true;
         this.global.sendFile(entidadGuardar.ArchivoBanner, entidadGuardar.ArchivoIcono, this.sorteoEditando.Id.toString()).subscribe(
           dataBanner => {
            this.showToast('info', 'Banner o Icono guardado con éxito', 'Archivo', 5000);
            console.log(dataBanner);
           },
           err => {
             this.loading= false;
             console.log(err);
             this.showToast('error', err, 'Archivo', 4000);
           },
           ()=>{
            //correcto
            this.loading = false;
            this.irSorteos();
           }
         )
       }
       else{
         this.loading = false;
         //no hay archivos seguir.
         this.limpiar();
         //lo vamos a tirar siempre a sorteo+
        this.irSorteos();
       }
      }
    );
  }
  irSorteos(){
    this.router.navigateByUrl('/sorteos')
    .then(data => console.log(data),
      error => {
        console.log(error);
      }
    )
  }

  handleFileSelected(event){
    console.log(event);
  }
  //revisar estas paginas
  //https://valor-software.com/ngx-bootstrap
  //timepicker
  //https://agranom.github.io/ngx-material-timepicker/
  //material icon
  //https://material.io/resources/icons/?icon=calendar_today&style=baseline
  //revisar esto
  //para arrastrar archivos en modo pc
  //https://www.npmjs.com/package/ngx-file-drop
  //muy importante para subir archivos
  //https://www.npmjs.com/package/angular-file-uploader


  
  cargarForma() {
    this.forma = new FormGroup({
      'nuevoNumero': new FormControl(0, [Validators.required, Validators.min(1)]),
      'nuevoCodigo': new FormControl('', [Validators.required]),
      'nuevoFechaSorteo': new FormControl(null, [Validators.required]),
      'nuevoHoraSorteo': new FormControl(null, [Validators.required]),
      'nuevoFechaInicio': new FormControl(null, [Validators.required]),
      'nuevoTitulo': new FormControl(''),
      'nuevoSubTitulo': new FormControl(''),
      'nuevoNumeroInicio': new FormControl(0, [Validators.required, Validators.min(1), Validators.max(10000)]),
      'nuevoNumeroTermino': new FormControl(0, [Validators.required, Validators.min(1), Validators.max(10000)]),
      'numeroValorSorteo': new FormControl(0, [Validators.required, Validators.min(0), Validators.max(50000)]),
      'nuevoUrlEvento': new FormControl(''),
    }, { validators: this.FechaSorteoMenor })
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

  FechaSorteoMenor: ValidatorFn = (fg: FormGroup) => {
    var retorno = true;
    const fechaSorteo = fg.get('nuevoFechaSorteo').value;
    const fechaInicio = fg.get('nuevoFechaInicio').value;
    //validamos siempre que no esten nulos
    if (fechaInicio !== null && fechaSorteo !== null){
      var fechaIni = moment(fechaInicio);
      var fechaSor = moment(fechaSorteo);
      if (fechaSor < fechaInicio){
        //escribimos el error
        this.forma.controls.nuevoFechaSorteo.setErrors({fechaInvalida: false});
      }

    }
    return null;
    /* 
    if (pass !== null && passR !== null && pass != passR){
      this.forma.controls.nuevoRepitaClave.setErrors({passIguales: false});
    }
    return pass !== null && passR !== null && pass != passR ? null : null ; */
  };

}