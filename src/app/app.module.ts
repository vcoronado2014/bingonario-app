import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ToastrModule } from 'ng6-toastr-notifications';
import { NgxLoadingModule } from 'ngx-loading';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
//servicios
import { ServicioLoginService } from './servicios/servicio-login-service';
import { UtilesService } from './servicios/utiles.service';
import { GajicoService } from './servicios/gajico.service';
import { PdfService } from './servicios/pdf.service';
import { FlowService } from './servicios/flow';
import { PayuService } from './servicios/payu';

//pages
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { HeaderAppComponent } from './header-app/header-app.component';
import { HeaderClienteComponent } from './header-cliente/header-cliente.component';
import { RegistroComponent } from './registro/registro.component';
import { FootterComponent } from './footter/footter.component';
import { InicioClienteComponent } from './inicio-cliente/inicio-cliente.component';
import { SorteosComponent } from './sorteos/sorteos.component';
import { EditarSorteoComponent } from './editar-sorteo/editar-sorteo.component';
import { EditarRegistroComponent } from './editar-registro/editar-registro.component';
import { EticketsComponent } from './etickets/etickets.component';
import { CambiarClaveComponent } from './cambiar-clave/cambiar-clave.component';
import { RecuperarClaveComponent } from './recuperar-clave/recuperar-clave.component';
import { CompraSorteoComponent } from './compra-sorteo/compra-sorteo.component';
import { CrearCortesiaComponent } from './crear-cortesia/crear-cortesia.component';
import { CartonesComponent } from './cartones/cartones.component';
import { CartonesAnuladosComponent } from './cartones-anulados/cartones-anulados.component';
import { SolicitudReembolsoComponent } from './solicitud-reembolso/solicitud-reembolso.component';
import { PruebasCompraComponent } from './pruebas-compra/pruebas-compra.component';
import { RespuestaCompraComponent } from './respuesta-compra/respuesta-compra.component';
import { ErrorCompraComponent } from './error-compra/error-compra.component';
import { ReporteDetalladoVentasComponent } from './reporte-detallado-ventas/reporte-detallado-ventas.component';
import { PreCompraComponent } from './pre-compra/pre-compra.component';
//plugin
import {MatGridListModule} from '@angular/material/grid-list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table';
import { Ng2CompleterModule } from "ng2-completer";
import { RecaptchaModule } from 'ng-recaptcha';
import { DeviceDetectorModule } from 'ngx-device-detector';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AngularFileUploaderModule } from "angular-file-uploader";
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Money, Currencies, Currency } from 'ts-money';
//pipes
import { CurrencyFormat } from './pipes/CurrencyFormat';
import { FilterPipe } from './pipes/filter'
import { VerificadorFechaPipe } from './pipes/verificador-fecha.pipe'
import { CapitalizarPipe } from './pipes/capitalizar.pipe'
import { TransformaHoraPipe } from './pipes/transforma-hora.pipe'

const dbConfig: DBConfig  = {
  name: 'MyDb',
  version: 1,
  objectStoresMeta: [{
    store: 'people',
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'name', keypath: 'name', options: { unique: false } },
      { name: 'email', keypath: 'email', options: { unique: false } }
    ]
  }]
};

@NgModule({
  declarations: [
    HeaderComponent,
    FootterComponent,
    HomeComponent,
    InicioClienteComponent,
    HeaderAppComponent,
    HeaderClienteComponent,
    AppComponent,
    LoginComponent,
    RegistroComponent,
    SorteosComponent,
    EditarSorteoComponent,
    EditarRegistroComponent,
    EticketsComponent,
    CambiarClaveComponent,
    RecuperarClaveComponent,
    CompraSorteoComponent,
    CrearCortesiaComponent,
    CartonesComponent,
    CartonesAnuladosComponent,
    SolicitudReembolsoComponent,
    PruebasCompraComponent,
    RespuestaCompraComponent,
    ErrorCompraComponent,
    ReporteDetalladoVentasComponent,
    PreCompraComponent,
    CurrencyFormat,
    FilterPipe,
    VerificadorFechaPipe,
    CapitalizarPipe,
    TransformaHoraPipe
  ],
  imports: [
    RecaptchaModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2CompleterModule,
    DataTablesModule,
    MatGridListModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatDatepickerModule,
    CdkTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatListModule,
    MatInputModule,
    MatNativeDateModule,
    MatTabsModule,
    MatExpansionModule,
    MatChipsModule,
    DeviceDetectorModule,
    AngularFileUploaderModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    NgxChartsModule,
    NgxMaterialTimepickerModule.setLocale('es-CL'),
    BrowserAnimationsModule, ToastrModule.forRoot(), NgxLoadingModule.forRoot({}),NgxMaskModule.forRoot(), BsDatepickerModule.forRoot(), ModalModule.forRoot(), NgxIndexedDBModule.forRoot(dbConfig)
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-CL' },
    MatDatepickerModule,
    ServicioLoginService,
    UtilesService,
    GajicoService,
    PdfService,
    FlowService,
    PayuService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
