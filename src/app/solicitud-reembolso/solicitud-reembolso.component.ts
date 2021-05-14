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

@Component({
    selector: 'app-solicitud-reembolso',
    templateUrl: './solicitud-reembolso.component.html',
    styleUrls: ['./solicitud-reembolso.component.css']
})
export class SolicitudReembolsoComponent implements OnInit {

    forma: FormGroup;
    loading = false;
    submitted = false;
    resolvedCaptcha = false;
    expCelular = /^(\+?56)?(\s?)(0?9)(\s?)[9876543]\d{7}$/gm;
    expPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$/gm;
    expEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/gm;
    keyRecaptcha = environment.SITE_KEY_RECAPTCHA;
    idCompra;

    constructor(
        private fb: FormBuilder,
        private auth: ServicioLoginService,
        private global: GajicoService,
        private router: Router,
        private toastr: ToastrManager,
        private _vcr: ViewContainerRef,
        private activatedRoute: ActivatedRoute
    ) {
        //this.toastr.setRootViewContainerRef(_vcr);
        this.activatedRoute.queryParams.subscribe((params) => {
            this.idCompra = parseInt(params['Id']);
            console.log(params['Id']);
        });

    }

    ngOnInit() {
        this.cargarForma();
        this.activatedRoute.queryParams.subscribe((params) => {
            this.idCompra = parseInt(params['Id']);
            console.log(params['Id']);
            this.forma.controls.nuevoIdCompra.setValue(this.idCompra);
            this.forma.controls.nuevoIdCompra.disable();
        });
    }
    // convenience getter for easy access to form fields
    get f() { return this.forma.controls; }

    onSubmit() {
        this.submitted = true;
        if (this.forma.invalid) {
            return;
        }
        //estamos todo bien
        var registro = {
            Id: 0,
            SmaId: this.forma.controls.nuevoIdCompra.value,
            EmailCompra: this.forma.controls.nuevoEmail.value,
            TelefonoCompra: this.forma.controls.nuevoTelefono.value,
            NombreCompleto: this.forma.controls.nuevoNombreCompleto.value,
            NumeroIdentificacion: this.forma.controls.nuevoRut.value,
            EmailBanco: this.forma.controls.nuevoEmailBanco.value,
            TipoCuenta: this.forma.controls.nuevoTipoCuenta.value,
            NumeroCuenta: this.forma.controls.nuevoNumeroCuenta.value,
            NombreBanco: this.forma.controls.nuevoBanco.value,
            Activo: 1,
            Eliminado: 0,
            EstaReembolsado: 0
        };
        this.loading = true;
        this.global.putSolicitudReembolso(registro).subscribe(
            (rs: any) => {
                this.loading = false;
                var datos: any = rs;
                //aca debemos validar el mensaje
                if (rs) {
                    this.showToast('success', 'Solicitud generada con éxito', 'Reembolso', 5000);
                }
                else {
                    //incorrecto
                    this.showToast('error', 'Error al generar la solictud', 'Reembolso', 3000);
                    console.log('incorrecto');
                }

            },
            er => {
                this.loading = false;
                //console.log('incorrecto' + er);
                this.showToast('error', er, 'Error', 5000);
            },
            () => {
                //todo correcto
                this.loading = false;
                this.router.navigateByUrl('/iniciocliente')
                    .then(data => console.log(data),
                        error => {
                            console.log(error);
                        }
                    )
            }
        );

        //alert('Correcto');
    }

    cargarForma() {

        this.forma = new FormGroup({
            'nuevoIdCompra': new FormControl(0),
            'nuevoRut': new FormControl('', [Validators.required]),
            'nuevoBanco': new FormControl('', [Validators.required]),
            'nuevoNumeroCuenta': new FormControl('', [Validators.required]),
            'nuevoTipoCuenta': new FormControl('', [Validators.required]),
            'nuevoNombreCompleto': new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]),
            'nuevoEmail': new FormControl('', [Validators.required, Validators.pattern(this.expEmail)]),
            'nuevoEmailBanco': new FormControl('', [Validators.required, Validators.pattern(this.expEmail)]),
            'nuevoTelefono': new FormControl('', [Validators.required, Validators.pattern(this.expCelular)]),
        });

        console.log(this.forma.valid + ' ' + this.forma.status);
    }
    volver() {
        this.router.navigateByUrl('/iniciocliente')
            .then(data => console.log(data),
                error => {
                    console.log(error);
                }
            )
    }

    showToast(tipo, mensaje, titulo, tiempo) {
        if (tiempo == null) {
            tiempo = 5000;
        }
        if (tipo == 'success') {
            this.toastr.successToastr(mensaje, titulo, {
                toastTimeout: tiempo
            });
        }
        if (tipo == 'error') {
            this.toastr.errorToastr(mensaje, titulo, {
                toastTimeout: tiempo
            });
        }
        if (tipo == 'info') {
            this.toastr.infoToastr(mensaje, titulo, {
                toastTimeout: tiempo
            });
        }
        if (tipo == 'warning') {
            this.toastr.warningToastr(mensaje, titulo, {
                toastTimeout: tiempo
            });
        }

    }
    dismiss(toast) {
        this.toastr.dismissToastr(toast);
    }

    PassIgualesValidator: ValidatorFn = (fg: FormGroup) => {
        const pass = fg.get('nuevoClave').value;
        const passR = fg.get('nuevoRepitaClave').value;
        if (pass !== null && passR !== null && pass != passR) {
            this.forma.controls.nuevoRepitaClave.setErrors({ passIguales: false });
        }
        return pass !== null && passR !== null && pass != passR ? null : null;
    };
}