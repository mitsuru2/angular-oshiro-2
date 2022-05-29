import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { HttpClientModule } from '@angular/common/http'; // for NGX Logger.

// PrimeNG modules.
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { SplashComponent } from './views/splash/splash.component';
import { EnterComponent } from './views/enter/enter.component';

@NgModule({
  declarations: [AppComponent, SplashComponent, EnterComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    HttpClientModule,
    LoggerModule.forRoot({
      //serverLoggingUrl: 'http://localhost:8080/',
      //serverLogLevel: NgxLoggerLevel.INFO,
      level: NgxLoggerLevel.TRACE,
    }),
    ButtonModule,
    ProgressSpinnerModule,
    DividerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
