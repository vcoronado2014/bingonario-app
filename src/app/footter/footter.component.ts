import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from "@angular/router";
//environments
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-footter',
    templateUrl: './footter.component.html',
    styleUrls: ['./footter.component.css']
  })

  export class FootterComponent implements OnInit {
/*     screenWidth: any;
    screenHeight: any; */
    logoYoutube = environment.YOUTUBE;
    logoInstagram = environment.INSTAGRAM;
    logoFacebook = environment.FACEBOOK;
    constructor(
        private router: Router
      ) {
    
       }

       //init
       ngOnInit() {

       }
  }