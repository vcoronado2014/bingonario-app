import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//pages
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { InicioClienteComponent } from './inicio-cliente/inicio-cliente.component';
import { SorteosComponent } from './sorteos/sorteos.component';
import { EditarSorteoComponent } from './editar-sorteo/editar-sorteo.component';
import { EditarRegistroComponent } from './editar-registro/editar-registro.component';
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

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'iniciocliente', component: InicioClienteComponent },
  { path: 'sorteos', component: SorteosComponent },
  { path: 'editarsorteo', component: EditarSorteoComponent },
  { path: 'editarsorteo', component: EditarSorteoComponent },
  { path: 'editarregistro', component: EditarRegistroComponent },
  { path: 'recuperarclave', component: RecuperarClaveComponent },
  { path: 'comprasorteo', component: CompraSorteoComponent },
  { path: 'crearcortesia', component: CrearCortesiaComponent },
  { path: 'cartones', component: CartonesComponent },
  { path: 'cartonesanulados', component: CartonesAnuladosComponent },
  { path: 'solicitudreembolso', component: SolicitudReembolsoComponent },
  { path: 'pruebascompra', component: PruebasCompraComponent },
  { path: 'reportedetalladoventas', component: ReporteDetalladoVentasComponent },
  { path: 'precompra', component: PreCompraComponent },
  /* { path: 'respuestacompra', component: RespuestaCompraComponent }, */
  { path: 'respuestacompra',  loadChildren: () => import('./respuesta-compra/respuesta-compra.component').then(m => m.RespuestaCompraComponent) },
  { path: 'errorcompra', component: ErrorCompraComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
