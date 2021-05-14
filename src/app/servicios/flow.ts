import { Injectable, Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Observable } from 'rxjs';

//crypto js
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import { async } from '@angular/core/testing';

@Injectable()
export class FlowService {
    urlConfirm = 'https://www.bingonario.cl/respuestacompra';
    apiKey = environment.API_KEY_FLOW;
    secretKey = environment.SECRET_KEY_FLOW;
    apiUrl = environment.URL_FLOW;
    //variables para generar los post de manera dinamica
    headerDynamic: Headers = new Headers;

    constructor(
        private httpClient: HttpClient,
    ) {


    }
    //recibe date yyyy-mm-dd
  getPayments(date) {
    var urlBase = environment.URL_FLOW + '/payment/getPayments';
    let params = {
      apiKey: environment.API_KEY_FLOW,
      date: date
    }
    //obtenemos los parametros
    var pack = this.getPack(params, 'GET');
    //la firma
    var sign = this.sign(params);
    console.log(sign);
    //ahora hacemos la llamada
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    //urlBase = urlBase + "?" + pack + "&s=" + '3034a92f809df4a7a9813e1b79d6b266efe00bd6345f02adc841d9d28ed5972f';
    urlBase = urlBase + "?" + pack + "&s=" + sign;
    httpHeaders.set('Access-Control-Allow-Origin', '*');
    let options = { headers: httpHeaders };
    let data = this.httpClient.get(urlBase, {});
    return data;

  }
  getStatusOrder(token) {
    var urlBase = environment.URL_FLOW + '/payment/getStatus';
    let params = {
      apiKey: environment.API_KEY_FLOW,
      token: token
    }
    //obtenemos los parametros
    var pack = this.getPack(params, 'GET');
    //la firma
    var sign = this.sign(params);
    console.log(sign);
    //ahora hacemos la llamada
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    urlBase = urlBase + "?" + pack + "&s=" + sign;
    httpHeaders.set('Access-Control-Allow-Origin', '*');
    let options = { headers: httpHeaders };
    let data = this.httpClient.get(urlBase, {});
    return data;
  }

  createOrder(subject, amount, email, commerceOrder){
    var urlBase = environment.URL_FLOW + '/payment/create';
    let params = {
      apiKey: environment.API_KEY_FLOW,
      subject: subject,
      currency: 'CLP',
      amount: amount,
      email: email,
      commerceOrder: commerceOrder,
      urlConfirmation: environment.URL_CONFRIMATION,
      urlReturn: environment.URL_RETURN
    }
    var pack = this.getPack(params, 'POST');
    var sign = this.sign(params);
    let data = axios.post(urlBase, `${pack}&s=${sign}`);
    return data;

  }
  createOrderPost(subject, amount, email, commerceOrder){
    var urlBase = environment.URL_FLOW + '/payment/create';
    let params = {
      apiKey: environment.API_KEY_FLOW,
      subject: subject,
      currency: 'CLP',
      amount: amount,
      email: email,
      commerceOrder: commerceOrder,
      urlConfirmation: environment.URL_CONFRIMATION,
      urlReturn: environment.URL_RETURN
    }
    var pack = this.getPack(params, 'POST');
    var sign = this.sign(params);
    let httpHeaders = new HttpHeaders({
      'Content-Type' : 'application/x-www-form-urlencoded'
  });
  //httpHeaders.set('Access-Control-Allow-Origin', '*');
  let options = { headers: httpHeaders };

  let data = this.httpClient.post(urlBase, `${pack}&s=${sign}`, options);
  return data;
/*     let data = axios.post(urlBase, `${pack}&s=${sign}`);
    return data; */

  }
/*   getPaymentsAxios(date) {
    var urlBase = environment.URL_FLOW + '/payment/getPayments';
    let params = {
      apiKey: environment.API_KEY_FLOW,
      date: date
    }
    //obtenemos los parametros
    var pack = this.getPack(params, 'GET');
    //la firma
    var sign = this.sign(pack);
    urlBase = urlBase + "?" + pack + "&s=" + '3034a92f809df4a7a9813e1b79d6b266efe00bd6345f02adc841d9d28ed5972f';
    let data = axios.get(urlBase);
    return data;

  } */
    
  
    sendGet(token, method, service) {
        return new Promise(async (resolve, reject) => {
            let url = `${this.apiUrl}/${service}`;

            var params = {
                token: token
            };

            let data = this.getPack(params, method.toUpperCase());
            let sign = this.sign(params);
            console.log(data);
            console.log(sign);
            let response;
            if (method == 'GET') {
                response = await this.httpGet(url, data, sign);
            }
            else {
                response = await this.httpPost(url, data, sign);
            }

            if (!!response["info"]) {
                let code = response.info.http_code;
                let body = response.output;
                if (code === 200) {
                  resolve(body);
                } else if ([400, 401].includes(code)) {
                  reject(Error(body.message));
                } else {
                  reject(Error("Unexpected error occurred. HTTP_CODE: " + code));
                }
              } else {
                reject(Error("Unexpected error occurred."));
              }

        });
    }
    send(commerceOrder, subject, currency, amount, email, paymentMethod, method, service) {
        return new Promise(async (resolve, reject) => {
            let url = `${this.apiUrl}/${service}`;

            var params = {
                apiKey: this.apiKey,
                commerceOrder: commerceOrder,
                subject: subject,
                currency: currency,
                amount: amount,
                email: email,
                paymentMethod: paymentMethod,
                urlConfirmation: this.urlConfirm,
                urlReturn: this.urlConfirm,
            };

            let data = this.getPack(params, method.toUpperCase());
            let sign = this.sign(params);
            console.log(data);
            console.log(sign);
            let response;
            if (method == 'GET') {
                response = await this.httpGet(url, data, sign);
            }
            else {
                response = await this.httpPost(url, data, sign);
            }

            if (!!response["info"]) {
                let code = response.info.http_code;
                let body = response.output;
                if (code === 200) {
                  resolve(body);
                } else if ([400, 401].includes(code)) {
                  reject(Error(body.message));
                } else {
                  reject(Error("Unexpected error occurred. HTTP_CODE: " + code));
                }
              } else {
                reject(Error("Unexpected error occurred."));
              }

        });
    }
    
    async construyeSignin(commerceOrder, subject, currency, amount, email, paymentMethod, method, service){
        let url = `${this.apiUrl}/${service}`;

        var params = {
            apiKey: this.apiKey,
            commerceOrder: commerceOrder,
            subject: subject,
            currency: currency,
            amount: amount,
            email: email,
            paymentMethod: paymentMethod,
            urlConfirmation: this.urlConfirm,
            urlReturn: this.urlConfirm,
        };

        let data = this.getPack(params, method.toUpperCase());
        let sign = this.sign(params);
        console.log(data);
        console.log(sign);
        let response;
        if (method == 'GET'){
            response = await this.httpGet(url, data, sign);
        }
        else {
            response = await this.httpPost(url, data, sign);
          }

    }
    private httpPost(url, data, sign) {
        return axios
          .post(url, `${data}&s=${sign}`)
          .then(response => {
            return {
              output: response.data,
              info: {
                http_code: response.status
              }
            };
          })
          .catch(error => {
            return {
              output: error.response.data,
              info: {
                http_code: error.response.status
              }
            };
          });
      }
    private httpGet(url, data, sign){
        url = url + "?" + data + "&s=" + sign;
        return axios
        .get(url)
        .then(response => {
          return {
            output: response.data,
            info: {
              http_code: response.status
            }
          };
        })
        .catch(error => {
          return {
            output: error.response.data,
            info: {
              http_code: error.response.status
            }
          };
        });
    }
    //construccion del signin
    private getPack(params, method) {
        const keys = Object.keys(params)
            .map(key => key)
            .sort((a, b) => {
                if (a > b) return 1;
                else if (a < b) return -1;
                return 0;
            });
        let data = [];
        keys.map(key => {
            if (method == "GET") {
                data.push(
                    encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
                );
            } else {
                data.push(key + "=" + params[key]);
            }
        });
        return data.join("&");
    }
    private sign(params) {
        const keys = Object.keys(params)
          .map(key => key)
          .sort((a, b) => {
            if (a > b) return 1;
            else if (a < b) return -1;
            return 0;
          });
        var toSign: any = [];
        keys.map(key => {
          toSign.push(key + "=" + params[key]);
        });
        toSign = toSign.join("&");
    
        return CryptoJS.HmacSHA256(toSign, environment.SECRET_KEY_FLOW);
      }


}