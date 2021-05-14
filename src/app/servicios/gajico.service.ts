import { Injectable, Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { Http, Headers, Response } from '@angular/http';
import { environment } from '../../environments/environment';

//import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { ɵAnimationGroupPlayer } from '@angular/animations';
//import 'rxjs/add/operator/retry';
//import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GajicoService {
    private usersObs: Observable<User[]>;
    private productObs: Observable<Productos[]>;
    private facturaObs: Observable<Factura[]>;
    private compraObs: Observable<Factura[]>;
    //variables para generar los post de manera dinamica
    headerDynamic: Headers = new Headers;

    constructor(
        private httpClient: HttpClient,
        //private http: Http
    ) {


    }
    //dinamico
    construyePost(body, nombreControlador) {
        const headers = new Headers;
        const bodyDinamic = body;

        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + nombreControlador;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, bodyDinamic, options);
        return data;

    }
    construyePostPayment(body, nombreControlador) {
        const headers = new Headers;
        const bodyDinamic = body;

        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.URL_FLOW + nombreControlador;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, bodyDinamic, options);
        return data;

    }

    construyePut(body, nombreControlador) {
        const headers = new Headers;
        const bodyDinamic = body;

        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + nombreControlador;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        let data = this.httpClient.put(url, bodyDinamic, options);
        return data;

    }
    //metodos bingonario
    putRegistro(registro) {
        const body = JSON.stringify({
            Registro: registro
        });
        return this.construyePut(body, 'Registro');
    }
    postRegistro(correo) {
        const body = JSON.stringify(
            {
                Correo: correo
            }
        );
        return this.construyePost(body, 'Registro');
    }
    postSorteos() {
        const body = JSON.stringify(
            {
                ReuId: '1'
            }
        );
        return this.construyePost(body, 'Sorteo');
    }
    getSorteoId(id) {
        let url = environment.API_ENDPOINT + 'Sorteo?id=' + id;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    putSorteo(sorteo) {
        const body = JSON.stringify({
            Sorteo: sorteo
        });
        return this.construyePut(body, 'Sorteo');
    }
    sendFile(File, FileIcon, id) {
        const headers = new Headers;
        let model = new FormData();
        model.append("UploadedBanner", File);
        model.append("UploadedIcono", FileIcon);
        model.append("Id", id);

        let url = environment.API_ENDPOINT + 'FileNuevo';
        let data = this.httpClient.post(url, model, {});
        return data;
    }

    postDesactivarSorteo(id) {
        const body = JSON.stringify(
            {
                Id: id.toString()
            }
        );
        return this.construyePost(body, 'DesactivarSorteo');
    }
    //entrega el ultimo numero de sorteo
    postUltimoId() {
        const body = JSON.stringify(
            {
                ReuId: '1'
            }
        );
        return this.construyePost(body, 'Parametros');
    }
    //entrega verdadero si existe el numero
    getExisteNumero(numero) {
        let url = environment.API_ENDPOINT + 'Parametros?numero=' + numero;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    postCambiarClave(nuevaClave, reuId, claveActual) {
        const body = JSON.stringify(
            {
                NuevaClave: nuevaClave,
                Id: reuId.toString(),
                ClaveActual: claveActual
            }
        );
        return this.construyePost(body, 'CambiarClave');
    }
    postRecuperarClave(usuario) {
        const body = JSON.stringify(
            {
                Usuario: usuario
            }
        );
        return this.construyePost(body, 'RecuperarClave');
    }
    //ojo que devuelve solo la lista de cartones sin mensaje
    postComprarSorteo(sotId, cantidad, usuId, nombreCompleto, email, telefono, esCortesia) {
        const body = JSON.stringify(
            {
                SotId: sotId.toString(),
                Cantidad: cantidad.toString(),
                UsuId: usuId.toString(),
                NombreCompleto: nombreCompleto,
                Email: email,
                Telefono: telefono,
                EsCortesia: esCortesia.toString()
            }
        );
        return this.construyePost(body, 'ComprarCartones');
    }
    /*     postSorteos(usuario) {
            const body = JSON.stringify(
                {
                    Usuario: usuario
                }
            );
            return this.construyePost(body, 'RecuperarClave');
        } */
    getCompras(usuId) {
        let url = environment.API_ENDPOINT + 'ObtenerCartones?usuId=' + usuId;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    getComprasSorteos(usuId, sotId, tipoConsulta) {
        let url = environment.API_ENDPOINT + 'ObtenerCartones?usuId=' + usuId.toString() + '&sotId=' + sotId.toString() + '&tipoConsulta=' + tipoConsulta.toString();
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    getComprasSorteosAdmin(usuId, sotId, tipoConsulta) {
        let url = environment.API_ENDPOINT + 'ObtenerCartones?usuId=' + usuId.toString() + '&sotId=' + sotId.toString() + '&tipoConsulta=' + tipoConsulta.toString();
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    //anula en base al id de sorteo maestro
    postAnularCarton(id) {
        const body = JSON.stringify(
            {
                Id: id.toString()
            }
        );
        return this.construyePost(body, 'AnularCarton');
    }
    postReenviarPdf(sotId, usuId, nombreCompleto, email, macId) {
        const body = JSON.stringify(
            {
                SotId: sotId.toString(),
                UsuId: usuId.toString(),
                NombreCompleto: nombreCompleto,
                Email: email,
                MacId: macId.toString(),
            }
        );
        return this.construyePost(body, 'PdfPrueba');
    }
    //anular
    postAnularSorteo(id) {
        const body = JSON.stringify(
            {
                Id: id.toString()
            }
        );
        return this.construyePost(body, 'AnularSorteo');
    }
    getComprasAnuladosAdmin(usuId) {
        let url = environment.API_ENDPOINT + 'ObtenerAnulados?usuId=' + usuId.toString();
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    //put solicitu reembolso
    putSolicitudReembolso(solicitud) {
        const body = JSON.stringify({
            Solicitud: solicitud
        });
        return this.construyePut(body, 'SolicitudReembolso');
    }
    putReembolsar(solicitud) {
        const body = JSON.stringify({
            Solicitud: solicitud
        });
        return this.construyePut(body, 'Reembolsar');
    }
    //canjear
    postCanjear(idOriginal, idNuevo, macId) {
        const body = JSON.stringify(
            {
                IdOriginal: idOriginal.toString(),
                IdNuevo: idNuevo.toString(),
                MacId: macId.toString()
            }
        );
        return this.construyePost(body, 'Canjear');
    }
    postPaymentCreate(signature) {
        const body = JSON.stringify(
            {
                s: signature
            }
        );
        return this.construyePostPayment(body, '/payment/create');
    }
    sendPayment(signed) {
        console.log(signed);
        const headers = new Headers;
        let model = new FormData();
        model.append("apiKey", environment.API_KEY_FLOW);
        model.append("subject", "Pago de prueba");
        model.append("currency", 'CLP');
        model.append("amount", '2000');
        model.append("email", 'vcoronado.alarcon@gmail.com');
        model.append("commerceOrder", '119983883');
        model.append("urlConfirmation", "https://www.bingonariocoro.cl:4200/respuestacompra");
        model.append("urlReturn", "https://www.bingonariocoro.cl:4200/respuestacompra");
        model.append("s", '3d8d617a89e1fd6f8d6e6d5195b32979106ad68e414fa58143ed1b73f257fe6d');

        let url = 'https://sandbox.flow.cl/api/payment/create';
        let data = this.httpClient.post(url, model, {});
        return data;
    }
    //ojo devuelve verdadero o falso
    postAnularCartonesCompra(cartones, nombreCompleto, email) {
        const body = JSON.stringify(
            {
                Cartones: cartones.toString(),
                NombreCompleto: nombreCompleto,
                Email: email
            }
        );
        return this.construyePost(body, 'AnularCartonesCompra');
    }
    postActualizarCartonesCompra(cartones) {
        const body = JSON.stringify(
            {
                Cartones: cartones.toString()
            }
        );
        return this.construyePost(body, 'ActualizarCartonesCompra');
    }
    //ahora recibe un objeto payment
    postActualizarCartonesCompraObjeto(flow) {
        const body = JSON.stringify(
            {
                Pago: flow
            }
        );
        return this.construyePost(body, 'ActualizarCartonesCompra');
    }
    //
    postReporteDetalladoVentas(sotId) {
        const body = JSON.stringify(
            {
                NombreReporte: 'detalle_ventas_sorteo',
                SotId: sotId.toString()
            }
        );
        return this.construyePost(body, 'Reportes');
    }
    postConfiguraciones(esProduccion) {
        const body = JSON.stringify(
            {
                EsProduccion: esProduccion.toString()
            }
        );
        return this.construyePost(body, 'Configuracion');
    }

    getTransaccionesCod(referenceCode) {
        let url = environment.API_ENDPOINT + 'TransaccionCompra?referenceCode=' + referenceCode;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    getTransaccionesUsu(usuId) {
        let url = environment.API_ENDPOINT + 'TransaccionCompra?usuId=' + usuId;
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };
        let data = this.httpClient.get(url, options);
        return data;
    }
    //marca eliminado transacciones
    postTransacciones(referenceCode) {
        const body = JSON.stringify(
            {
                ReferenceCode: referenceCode
            }
        );
        return this.construyePost(body, 'TransaccionCompra');
    }

    //inserta transaccion
    putTransaccion(transaccion) {
        const body = JSON.stringify({
            Transaccion: transaccion
        });
        return this.construyePut(body, 'TransaccionCompra');
    }

    //******************************** */

}
//creacion de la interface
export interface Sorteo{
    Id: number,
    Numero: number,
    FechaHoraSorteo: string,
    Activo: number,
    Banner: string,
    Codigo: string,
    Detalle: string,
    Eliminado: number,
    FechaCreacion: string,
    FechaInicio: string,
    FechaTermino: string,
    Icono: string,
    ReuIdCreador: number,
    Titulo: string,
    Subtitulo: string,
    EsAnulado: number,
}
export interface User {
    RutClient: string;
    DigClient: string;
    NomClient: string;
    GirClient: string;
    DirClient: string;
    ComClient: string;
    CiuClient: string;
    TelClient: string;
    FaxClient: string;
    AneClient: string;
    ConClient: string;
    Id: number;
    Eliminado: number;
    CorreoClient: string;
    FleLocal: string;
    FleDomici: string;
    DesClient: string;
  }
  export interface Proveedor {
    RutProved: string;
    DigProved: string;
    NomProved: string;
    GirProved: string;
    DirProved: string;
    ComProved: string;
    CiuProved: string;
    TelProved: string;
    FaxProved: string;
    AneProved: string;
    Id: number;
    Eliminado: number;
    CorreoProved: string;
  }
  export interface Productos {
    CodProduc: string;
    NomProduc: string;
    EstProduc: string;
    VolProduc: string;
    ValProduc: string;
    StoProduc: string;
    ArrProduc: string;
    PreProduc: string;
    GarProduc: string;
    Id: number;
    Eliminado: number;
  }
  export interface Factura {
    TipFactur: string;
    NumFactur: string;
    RutFactur: string;
    DigFactur: string;
    FeeFactur: string;
    ValFactur: string;
    EstFactur: string;
    ConFactur: string;
    GuiFactur: string;
    SalFactur: string;
    FesFactur: string;
    CheFactur: string;
    BanFactur: string;
    FveFactur: string;
    FevFactur: string;
    Neto: string,
    Iva: string,
    Total: string,
    Id: number;
    Eliminado: number;
    Detalle: Detalle[];
    Cliente: User;
    Proveedor: Proveedor;
  }
  export interface Detalle{
    TipDetall: string;
    NumDetall: string;
    CanDetall: string;
    VolDetall: string;
    ProDetall: string;
    RecDetall: string;
    PreDetall: string;
    NetDetall: string;
    IvaDetall: string;
    CilDetall: string;
    DiaDetall: string;
    ArrDetall: string;
    CafDetall: string;
    MofDetall: string;
    NomProduc: string;
    Id: number;
    Eliminado: number;
  }
  export interface Compra{
    IdSorteoMaestro: number,
    NumeroSorteo: number,
    Afiche: string;
    FechaHoraSorteo: string,
    NombreCompleto: string,
    Email: string,
    Telefono: string,
    Valor: number,
    EsCortesia: number,
    EstaDisponible: number,
    EstaPagado: number,
    MacId: number,
    UrlPdf: string,
    UrlEvento: string,
    EsAnulado: number,
    PideReembolso: number,
    EstaCanjeado: number,
    MacIdCanjeado: number,
    EstadoSorteo: number,
    Icono: string,
    Tipo: string,
    FechaOperacion: string,
    EstadoStr: string,
  }