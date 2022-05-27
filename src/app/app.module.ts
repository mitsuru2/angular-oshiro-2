import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { HttpClientModule, HttpHeaders } from '@angular/common/http'; // for NGX Logger.

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    HttpClientModule,
    LoggerModule.forRoot({
      serverLoggingUrl: 'http://localhost:8080/',
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.INFO,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
