import { Injectable, Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
//utiles
import { UtilesService } from './utiles.service';

import { Observable } from 'rxjs';

//crypto js
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import { async } from '@angular/core/testing';

@Injectable()
export class PayuService {
    urlConfirm = '';
    apiLogin = '';
    apiKey = '';
    apiUrl = '';
    languaje = 'es';
    command = '';
    test = true;
    configuraciones: any;
    //variables para generar los post de manera dinamica
    headerDynamic: Headers = new Headers;

    constructor(
        private httpClient: HttpClient,
        private utiles: UtilesService
    ) {
        this.configuraciones = JSON.parse(localStorage.getItem('CONFIGURACION'));
        //SET PARAMS
        if (this.configuraciones.Parametros.EsProduccion == 1){
            this.test = false;
        }
    }
    //queda funcionando el ping
    //no queda funcionando el desencriptar
    postPing(){
        var url = environment.URL_REPORTS_PAYU;
        let params = {
            "test": this.test,
            "language": this.languaje,
            "command": "PING",
            "merchant": {
               "apiLogin": environment.API_LOGIN_PAYU,
               "apiKey": environment.API_KEY_PAYU
            }
         }
         let data = axios.post(url, params);
         return data;
    }
    postMediosPago(){
        //la url de pagos es distinta, agregar al modelo
        //https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi
        var url = environment.URL_PAYMENT_PAYU;
        let params = {
            "test": this.test,
            "language": this.languaje,
            "command": "GET_PAYMENT_METHODS",
            "merchant": {
               "apiLogin": environment.API_LOGIN_PAYU,
               "apiKey": environment.API_KEY_PAYU
            }
         }
         let data = axios.post(url, params);
         return data;
    }
    getConverter(fromCurrency, toCurrency, cb){
        var apiKey = environment.API_KEY_CONVERTER;
        //https://free.currconv.com/api/ v7 / convert? Q = USD_PHP & compact = ultra & apiKey = 252ae632a706147d020b
        var url = environment.URL_CONVERTER;
        var query = '?q=' + encodeURIComponent(fromCurrency) + '_' + encodeURIComponent(toCurrency);
        var urlFin = url + query + '&compact=ultra&apiKey=' + apiKey;
        let data = axios.get(urlFin);
        return data;

    }

}