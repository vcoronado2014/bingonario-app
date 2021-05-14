import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { merge, Observable, of as observableOf } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ToastrManager } from 'ng6-toastr-notifications';


//servicios

import { GajicoService, Sorteo, Compra } from '../servicios/gajico.service';
import { UtilesService } from '../servicios/utiles.service';

//completer
import { CompleterService, CompleterData } from 'ng2-completer';

//dialog
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatIcon, MatList, MatButton } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatFormField } from '@angular/material/form-field';
import { MatSort } from '@angular/material/sort';
import { PdfService } from '../servicios/pdf.service';


declare var $: any;
import * as moment from 'moment';
import swal from 'sweetalert2';

@Component({
  selector: 'app-cartones',
  templateUrl: './cartones.component.html',
  styleUrls: ['./cartones.component.css']
})

export class CartonesComponent implements OnInit {
  /* displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA); */
  displayedColumns: string[] = ['NumeroSorteo', 'NombreCompleto', 'Email', 'Telefono', 'Informacion'];
  dataSource = new MatTableDataSource<Compra>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  sorteosUsuario: Compra[] = [];
  sorteos: Sorteo[] = [];

  @ViewChild(MatPaginator, { static: true }) paginatorS: MatPaginator;

  loading = false;
  ///sorteos: Observable<Sorteo[]>;
  //mobile
  isMobile = false;
  sorteoMostrando: any = {
    Numero: 0
  };

  idSorteo = 0;

  tipoBusqueda = [
    {
      Nombre: 'Todos',
      Valor: 0
    },
    {
      Nombre: 'Cortesías',
      Valor: 1
    }
    /*     ,
        {
          Nombre: 'Pagados',
          Valor: 2
        }
        ,
        {
          Nombre: 'No Pagados',
          Valor: 2
        } */
  ];

  tipoBusquedaSelected = 0;
  //sorteo selected
  sorteoSelected = 0;
  sorteoEntidadSelected = {
    Activo: 0,
    Banner: "",
    CartonesCortesia: 0,
    CartonesDisponibles: 0,
    CartonesPagados: 0,
    CartonesUsados: 0,
    Codigo: "Cod-0",
    Detalle: "",
    Eliminado: 0,
    FechaCreacion: "",
    FechaHoraSorteo: "",
    FechaInicio: "",
    FechaTermino: "",
    HoraSorteo: null,
    Icono: "#",
    Id: 0,
    InicioCartones: 0,
    Numero: 0,
    ReuIdCreador: 0,
    Subtitulo: "",
    TerminoCartones: 0,
    TieneCartones: 0,
    Titulo: "",
    TotalVendido: 0,
    ValorSorteo: 0,
    EsAnulado: 0
  };
  usuario;
  rol;


  constructor(
    private httpClient: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private gajico: GajicoService,
    private toastr: ToastrManager,
    public completerService: CompleterService,
    public utiles: UtilesService,
    public dialog: MatDialog,
    private _vcr: ViewContainerRef,
    public pdf: PdfService,
    private elementRef: ElementRef,
    private activatedRoute: ActivatedRoute

  ) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.idSorteo = parseInt(params['Id']);
      console.log(params['Id']);
      //buscar los cartones por id sorteo
      //esto hay que cambiarlo depués
      this.dataSource = new MatTableDataSource(this.sorteosUsuario);
      this.dataSource.paginator = this.paginator;
      console.log(this.dataSource);

    });
  }

  editarSorteo(id) {
    var esNUevo = false;
    console.log(id);
    if (id == 0) {
      esNUevo = true;
    }
    this.router.navigate(['editarsorteo'], {
      queryParams: {
        Id: id,
        EsNuevo: esNUevo
      }
    })
  }
  ngOnInit(): void {
    this.isMobile = this.utiles.EsMobil();
    if (sessionStorage.getItem('USER_LOGUED_IN')) {
      this.usuario = JSON.parse(sessionStorage.getItem('USER_LOGUED_IN'));
    }
    if (sessionStorage.getItem('USER_ROL')) {
      this.rol = JSON.parse(sessionStorage.getItem('USER_ROL'));
    }
    //paginator
    this.traslatePaginator();
    this.cargarSorteosCombo();
    this.activatedRoute.queryParams.subscribe((params) => {
      this.idSorteo = parseInt(params['Id']);
      console.log(params['Id']);
      //buscar los cartones por id sorteo
      //esto hay que cambiarlo depués
      //ACÁ QUEDÉ, SE DEBE GENERAR LOS METODOS NECESARIOS PARA BUSCAR LOS CARTONES
      this.LoadTable(this.idSorteo, this.tipoBusquedaSelected);
      this.dataSource.paginator = this.paginator;
      console.log(this.dataSource);
    });
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  comprarCortesias(sorteo) {
    console.log(sorteo);
    sessionStorage.setItem('SORTEO_COMPRANDO_CORTESIA', JSON.stringify(sorteo));
    this.router.navigateByUrl('/crearcortesia')
      .then(data => console.log(data),
        error => {
          console.log(error);
        }
      )

  }
  traslatePaginator() {
    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Items por página';
      this.paginator._intl.firstPageLabel = 'Primera página';
      this.paginator._intl.lastPageLabel = 'Última página';
      this.paginator._intl.nextPageLabel = 'Siguiente';
      this.paginator._intl.previousPageLabel = 'Anterior';
      this.paginator._intl.getRangeLabel = this.getRangeLabel.bind(this);
      console.log(this.paginator._intl);
    }
  }
  private getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0 || pageSize === 0) {
      return 'No hay';
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return (startIndex + 1).toString() + ' - ' + endIndex.toString() + ' de ' + length.toString();
  }

  desactivarSorteo(id) {
    swal.fire(
      {
        title: '¿Estás seguro de desactivar?',
        text: 'Se quitará del listado.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'SI, QUIERO DESACTIVAR!',
        cancelButtonText: 'NO, CANCELAR TODO!',
      }
    ).then((value) => {
      if (value.dismiss) {
        //swal.fire('Cancelado');
      }
      else {
        //console.log(retorno);
        //lo comentamos para pruebas
        console.log(id);
        this.loading = true;
        this.gajico.postDesactivarSorteo(id).subscribe((data: any) => {
          this.sorteosUsuario = this.transformaEntidad(data.Sorteos);
          this.dataSource = new MatTableDataSource(this.sorteosUsuario);
          this.dataSource.paginator = this.paginator;
        },
          err => {
            console.log(err);
            this.loading = false;
            this.showToast('error', err, 'Error', 5000);
          },
          () => {
            //correcto
            this.loading = false;
            this.showToast('success', 'Desactivado con éxito', 'Sorteo', 3000);
          }
        )
      }
    });
  }
  openPdf(url) {
    window.open(url, '_blank');
  }
  anularCarton(id) {
    swal.fire(
      {
        title: '¿Estás seguro de anular?',
        text: 'Se anulará el cartón seleccionado.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'SI, QUIERO ANULAR!',
        cancelButtonText: 'NO, CANCELAR TODO!',
      }
    ).then((value) => {
      if (value.dismiss) {
        //swal.fire('Cancelado');
      }
      else {
        //console.log(retorno);
        //lo comentamos para pruebas
        console.log(id);
        this.loading = true;
        this.gajico.postAnularCarton(id).subscribe((res: any) => {
          if (res) {
            //volvemos a cargar la lista

            //this.buscarSorteo();
            if (this.sorteoEntidadSelected) {
              //hay que restar y sumar
              this.sorteoEntidadSelected.CartonesCortesia--;
              this.sorteoEntidadSelected.CartonesDisponibles++;
              this.sorteoEntidadSelected.CartonesUsados--;
            }
            this.cargarSorteosCombo();
            //this.LoadTable(this.idSorteo, this.tipoBusquedaSelected);
          }
          else {
            this.showToast('error', 'Error al anular cartón', 'Error', 5000);
          }
        },
          err => {
            console.log(err);
            this.loading = false;
            this.showToast('error', err, 'Error', 5000);
          },
          () => {
            //correcto
            this.loading = false;
            this.showToast('success', 'Anulado con éxito', 'Sorteo', 3000);
          }
        )
      }
    });
  }
  transformaEntidad(arrCompras) {
    var retorno = [];
    if (arrCompras && arrCompras.length > 0) {
      arrCompras.forEach(element => {
        var urlAfiche = '';
        if (element.Afiche && element.Afiche != '' && element.Afiche != '#' && element.Afiche.length > 5) {
          urlAfiche = environment.URL_SLIDE + element.Afiche;
        }
        if (element.UrlPdf && element.UrlPdf != '') {
          element.UrlPdf = environment.URL_PDF + element.UrlPdf;
        }
        element.Afiche = urlAfiche;
        retorno.push(element);

      });
    }
    return retorno;
  }

  reenviarPdf(carton) {
    swal.fire(
      {
        title: '¿Estás seguro de reenviar el cartón?',
        text: 'Elcartón será enviado nuevamente a su correo electrónico.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'SI, QUIERO ENVIAR!',
        cancelButtonText: 'NO, CANCELAR TODO!',
      }
    ).then((value) => {
      if (value.dismiss) {
        //swal.fire('Cancelado');
      }
      else {
        //sotId, usuId, nombreCompleto, email, macId
        var sotId = carton.NumeroSorteo;
        var usuId = this.usuario.Id;
        var nombreCompleto = carton.NombreCompleto;
        var email = carton.Email;
        var macId = carton.MacId;
        this.loading = true;
        this.gajico.postReenviarPdf(sotId, usuId, nombreCompleto, email, macId).subscribe((res: any) => {
          if (res) {
            this.showToast('success', 'Cartón enviado con éxito', 'Reenvío', 3000);
          }
          else {
            this.showToast('error', 'Ocurrió un error al reenviar el correo', 'Reenvío', 4000);
          }
        },
          error => {
            this.loading = false;
            console.log(error);
            this.showToast('error', error, 'Error al reenviar', 5000);
          },
          () => {
            this.loading = false;
            console.log('correcto');
          }
        )
      }
    });
  }

  LoadTable(sotId, tipoBusqueda) {

    this.loading = true;
    var usuId = this.usuario.Id;
    this.gajico.getComprasSorteosAdmin(usuId, sotId, tipoBusqueda).subscribe((res: any) => {
      this.sorteosUsuario = this.transformaEntidad(res);
      this.dataSource = new MatTableDataSource(this.sorteosUsuario);
      this.dataSource.paginator = this.paginator;
      console.log(this.dataSource);
      console.log(this.sorteosUsuario);
      this.loading = false;
    })
  }
  buscarSorteo() {
    if (this.sorteos) {
      this.sorteos.forEach((element: any) => {
        if (this.idSorteo == element.Numero) {
          this.sorteoEntidadSelected = element;
          console.log(this.sorteoEntidadSelected);
          //volvemos a hacer la llamada
          this.LoadTable(this.idSorteo, this.tipoBusquedaSelected);
          return;
        }
      });
    }
  }
  onChangeSorteo(event) {
    console.log(event.target.value);
    this.idSorteo = event.target.value;
    this.buscarSorteo();
  }
  onChangeSorteoBusqueda(event) {
    console.log(event.target.value);
    this.tipoBusquedaSelected = event.target.value;
    this.buscarSorteo();
  }
  cargarSorteosCombo() {
    this.loading = true;
    this.gajico.postSorteos().subscribe((res: any) => {
      this.loading = false;
      this.sorteos = res.Sorteos;
      //agregamos el sorteo 0
      this.sorteos.push(this.sorteoEntidadSelected);
      console.log(this.sorteos);
      //seleccionamos el sorteo por defecto
      this.sorteoSelected = this.idSorteo;
      this.buscarSorteo();
    })
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

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobile = this.utiles.EsMobil();
    console.log(this.isMobile);
    if (this.isMobile == false) {
      //this.destroyTable();
      //this.LoadTable();
    }

  }

}
