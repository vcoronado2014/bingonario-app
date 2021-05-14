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
  selector: 'app-crear-cortesia',
  templateUrl: './crear-cortesia.component.html',
  styleUrls: ['./crear-cortesia.component.css']
})
export class CrearCortesiaComponent implements OnInit {
    usuario;
    rol;
    sorteoComprando;
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
    private _vcr: ViewContainerRef
  ) {
    //this.toastr.setRootViewContainerRef(_vcr);


   }
   usarMisDatos(){
     if (this.usuario){
       this.formaComprador.controls.nuevoNombreCompleto.setValue(this.usuario.NombreCompleto);
       this.formaComprador.controls.nuevoTelefono.setValue(this.usuario.Telefono);
       this.formaComprador.controls.nuevoEmail.setValue(this.usuario.Email);
       this.formaComprador.controls.nuevoRepitaEmail.setValue(this.usuario.Email);
     }
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
        if (sessionStorage.getItem('SORTEO_COMPRANDO_CORTESIA')) {
            this.sorteoComprando = JSON.parse(sessionStorage.getItem('SORTEO_COMPRANDO_CORTESIA'));
        }
        sessionStorage.removeItem('SORTEO_COMPRANDO_CORTESIA');
        console.log(this.sorteoComprando);
        this.cargarForma();
        this.cargarFormaComprador();
    }
  // convenience getter for easy access to form fields
  get f() { return this.formaComprador.controls; }

  onSubmit(){
    this.submitted = true;
    console.log(this.formaComprador);
    console.log(this.formaSorteo);
    if (this.formaSorteo.invalid || this.formaComprador.invalid){
      return;
    }
    //aca seguimos con el proceso de compra
    var correcto = false;
    var sotId = this.formaSorteo.controls.nuevoNroSorteo.value;
    var cantidad = this.formaSorteo.controls.nuevoCantidad.value;
    var usuId = this.usuario.Id;
    var nombreCompleto = this.formaComprador.controls.nuevoNombreCompleto.value;
    var email = this.formaComprador.controls.nuevoEmail.value;
    var telefono = this.formaComprador.controls.nuevoTelefono.value;
    var esCortesia = 1;
    this.loading = true;
    this.global.postComprarSorteo(sotId, cantidad, usuId, nombreCompleto, email, telefono, esCortesia).subscribe(
      (rs: any)=> {
        this.loading = false;
        var datos: any = rs;
        //aca debemos validar el mensaje
        if (datos && datos.length > 0){
          correcto = true;
        }
        else{
          //incorrecto
          this.showToast('error', 'Error al comprar', 'Compra', 3000);
          console.log('incorrecto');
        }
      },
      er => {
        this.loading = false;
        //console.log('incorrecto' + er);
        this.showToast('error',er,'Error', 5000); 
      },
      () => {
        if (correcto){
          console.log('Seguir con el proceso de compra');
          //aca deberiamos seguir con el proceso de compra
          //por mientras lo derivamos a inicio de usuario
          this.showToast('success', 'Compra realizada con éxito', 'Compra', 5000);
          if (this.esAdmin){
            this.router.navigateByUrl('/sorteos')
            .then(data => console.log(data),
              error =>{
                console.log(error);
              }
            )
          }
          else{
            this.router.navigateByUrl('/iniciocliente')
            .then(data => console.log(data),
              error =>{
                console.log(error);
              }
            )
          }
        }
        else{
          console.log('error de servidor al comprar');
        }
        
      }
    );

  }
  cancelar(){
    this.router.navigateByUrl('/sorteos')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
  }

  cargarForma() {
    var nroSorteo = this.sorteoComprando == null ? 0 : this.sorteoComprando.Numero;
    //dejamos el titulo como producto
    var producto = this.sorteoComprando == null ? '' : this.sorteoComprando.Titulo;
    var precio = this.sorteoComprando == null ? 0 : this.sorteoComprando.ValorSorteo;
    this.fotoSorteo = this.sorteoComprando == null ? '#' : this.sorteoComprando.Banner;
    var subtotal = this.sorteoComprando == null ? 0 : this.sorteoComprando.ValorSorteo;

    this.formaSorteo = new FormGroup({
      'nuevoNroSorteo': new FormControl(nroSorteo, [Validators.required]),
      'nuevoProducto': new FormControl(producto, [Validators.required]),
      'nuevoPrecio': new FormControl(precio, [Validators.required]),
      'nuevoCantidad': new FormControl(1, [Validators.required]),
      'nuevoSubtotal': new FormControl(subtotal, [Validators.required]),
    });
    //desactivamos
    this.formaSorteo.controls.nuevoNroSorteo.disable();
    this.formaSorteo.controls.nuevoProducto.disable();
    this.formaSorteo.controls.nuevoPrecio.disable();
    this.formaSorteo.controls.nuevoSubtotal.disable();

  }
  cargarFormaComprador() {

    this.formaComprador = new FormGroup({
        'nuevoNombreCompleto': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]),
        'nuevoEmail': new FormControl('', [Validators.required, Validators.pattern(this.expEmail)]),
        'nuevoRepitaEmail': new FormControl('', [Validators.required]),
        'nuevoTelefono': new FormControl('', [Validators.required, Validators.pattern(this.expCelular)]),
    }, { validators: this.EmailIgualesValidator });

    //console.log(this.forma.valid + ' ' + this.forma.status);
}
  onChangeCantidad(event){
    console.log(event);
    if (event.target.value){
      //calculamos subtotal
      var cantidad = parseInt(event.target.value);
      var precio = this.formaSorteo.controls.nuevoPrecio == null ? 0 : this.formaSorteo.controls.nuevoPrecio.value;
      var subtotal = cantidad * precio;
      this.formaSorteo.controls.nuevoSubtotal.setValue(subtotal);
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
  EmailIgualesValidator: ValidatorFn = (fg: FormGroup) => {
    const email = fg.get('nuevoEmail').value;
    const emailR = fg.get('nuevoRepitaEmail').value;
    if (email !== null && emailR !== null && email != emailR){
      this.formaComprador.controls.nuevoRepitaEmail.setErrors({emailIguales: false});
    }
    return email !== null && emailR !== null && email != emailR ? null : null ;
  };
}