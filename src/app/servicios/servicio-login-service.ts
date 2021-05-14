import { Injectable, Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { Http, Headers, Response } from '@angular/http';
import { environment } from '../../environments/environment';

//import 'rxjs/add/operator/map';

@Injectable()
export class ServicioLoginService{
  username:string;
  loggedIn:boolean;
  mensajeError:string;

  constructor( 
    //private http: Http,
    private httpClient: HttpClient,
  ){

    //inicializamos los valores
    this.username = "";
    this.loggedIn = false;
    this.mensajeError = "Error en llamada Http";
    
  }
  loginData(usuario, clave){
    const headers = new Headers;
    const body = JSON.stringify(
        {
            "usuario": usuario,
            "password": clave
        }
    );
    headers.append('Access-Control-Allow-Origin', '*');

    let url = environment.API_ENDPOINT + 'login';
    let httpHeaders = new HttpHeaders({
        'Content-Type' : 'application/json',
        'Cache-Control': 'no-cache'
    });
    httpHeaders.set('Access-Control-Allow-Origin', '*');

    let options = { headers: httpHeaders };
    let data = this.httpClient.post(url, body, options);
    return data;
  }

  login(usuario, clave) {
    const headers = new Headers;
    const body = JSON.stringify(
        {
            usuario: usuario,
            password: clave
        }
    );
    headers.append('Access-Control-Allow-Origin', '*');

    let url = environment.API_ENDPOINT + 'login';
    let httpHeaders = new HttpHeaders({
        'Content-Type' : 'application/json',
        'Cache-Control': 'no-cache'
    });
    httpHeaders.set('Access-Control-Allow-Origin', '*');

    let options = { headers: httpHeaders };
    //let data = this.httpClient.post(url, body, options);
    this.httpClient.post(url, body, options).subscribe(
        data => {
            console.log(data);
            if (data){
                this.loggedIn = true;
                //guardamos la variable de session
                var datos = JSON.stringify(data);
                sessionStorage.setItem("USER_LOGUED_IN", datos);
            }
            else{
                this.loggedIn = false;
            }
        }
    )

    return this.loggedIn;

/*
    return this.http.post(url, dataGet, { headers: new Headers({ 'Content-Type': 'application/json' }) })
      .map((data) =>
        data.json()
      ).map(data => {
        //control de errores
        
        if (data){
          this.loggedIn = true;
          //guardamos la variable de session
          var datos = JSON.stringify(data);
          sessionStorage.setItem("USER_LOGUED_IN", datos);
        }
        
        else{
          this.loggedIn = false;
        }
        return this.loggedIn;
      });
      */
  }
  /*
        const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: instId
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Cliente';
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;
  */

  logout():void{
    sessionStorage.clear();
    this.username = "";
    this.loggedIn = false;
  }

  isLoggedId(){
    return this.loggedIn;
  }

}